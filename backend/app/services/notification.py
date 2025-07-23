"""
Notification Service
Handles notification creation, delivery, and management
"""

import asyncio
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_

from app.models import User, Notification, PriceAlert, Asset
from app.models.notifications import NotificationType, NotificationStatus, PriceAlertCondition
from app.db.database import get_async_db
from app.services.telegram_bot import telegram_bot
from app.core.config import settings

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self):
        self.telegram_enabled = True
        self.email_enabled = False
        self.push_enabled = False

    async def send_notification(self, notification: Notification, db: Optional[AsyncSession] = None):
        """Send notification through configured channels"""
        
        if not db:
            async for session in get_async_db():
                db = session
                break
        
        try:
            # Update notification status
            notification.status = NotificationStatus.PROCESSING
            notification.sent_at = datetime.utcnow()
            await db.commit()
            
            # Get user for notification
            user = await db.get(User, notification.user_id)
            if not user:
                await self._mark_notification_failed(notification, "User not found", db)
                return False
            
            # Send through configured channels
            channels = notification.channels or ["in_app"]
            success = True
            
            for channel in channels:
                try:
                    if channel == "telegram" and self.telegram_enabled:
                        await self._send_telegram_notification(notification, user, db)
                    elif channel == "email" and self.email_enabled:
                        await self._send_email_notification(notification, user, db)
                    elif channel == "push" and self.push_enabled:
                        await self._send_push_notification(notification, user, db)
                    elif channel == "in_app":
                        # In-app notifications are stored in database automatically
                        pass
                    else:
                        logger.warning(f"Unknown or disabled notification channel: {channel}")
                        
                except Exception as e:
                    logger.error(f"Failed to send notification via {channel}: {str(e)}")
                    success = False
            
            # Update final status
            if success:
                notification.status = NotificationStatus.SENT
                notification.delivered_at = datetime.utcnow()
            else:
                notification.status = NotificationStatus.FAILED
                notification.failed_at = datetime.utcnow()
                notification.error_message = "Failed to deliver through some channels"
            
            await db.commit()
            return success
            
        except Exception as e:
            await self._mark_notification_failed(notification, str(e), db)
            logger.error(f"Error sending notification {notification.id}: {str(e)}")
            return False

    async def _send_telegram_notification(self, notification: Notification, user: User, db: AsyncSession):
        """Send notification via Telegram"""
        
        if not user.telegram_chat_id:
            logger.warning(f"User {user.id} has no Telegram chat ID")
            return
        
        try:
            # Format message
            message = f"🔔 *{notification.title}*\n\n{notification.message}"
            
            if notification.is_actionable and notification.action_url:
                message += f"\n\n[Перейти]({notification.action_url})"
            
            # Add priority emoji
            if notification.priority == "high":
                message = "🔥 " + message
            elif notification.priority == "urgent":
                message = "🚨 " + message
            
            # Send message
            await telegram_bot.send_message(
                chat_id=user.telegram_chat_id,
                text=message,
                parse_mode="Markdown"
            )
            
            logger.info(f"Telegram notification sent to user {user.id}")
            
        except Exception as e:
            logger.error(f"Failed to send Telegram notification: {str(e)}")
            raise

    async def _send_email_notification(self, notification: Notification, user: User, db: AsyncSession):
        """Send notification via Email"""
        # Email implementation would go here
        # For now, just log
        logger.info(f"Email notification would be sent to {user.email}")

    async def _send_push_notification(self, notification: Notification, user: User, db: AsyncSession):
        """Send push notification"""
        # Push notification implementation would go here
        logger.info(f"Push notification would be sent to user {user.id}")

    async def _mark_notification_failed(self, notification: Notification, error: str, db: AsyncSession):
        """Mark notification as failed"""
        notification.status = NotificationStatus.FAILED
        notification.failed_at = datetime.utcnow()
        notification.error_message = error
        await db.commit()

    async def create_notification(
        self, 
        user_id: str,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.INFO,
        priority: str = "normal",
        is_actionable: bool = False,
        action_url: Optional[str] = None,
        channels: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None
    ) -> Notification:
        """Create and send notification"""
        
        if not db:
            async for session in get_async_db():
                db = session
                break
        
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            priority=priority,
            is_actionable=is_actionable,
            action_url=action_url,
            channels=channels or ["telegram", "in_app"],
            metadata=metadata
        )
        
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        
        # Send notification asynchronously
        asyncio.create_task(self.send_notification(notification, db))
        
        return notification

    async def check_price_alerts(self, db: Optional[AsyncSession] = None):
        """Check and trigger price alerts"""
        
        if not db:
            async for session in get_async_db():
                db = session
                break
        
        try:
            # Get all active price alerts
            result = await db.execute(
                select(PriceAlert).where(PriceAlert.is_active == True)
            )
            alerts = result.scalars().all()
            
            for alert in alerts:
                await self._check_single_price_alert(alert, db)
                
        except Exception as e:
            logger.error(f"Error checking price alerts: {str(e)}")

    async def _check_single_price_alert(self, alert: PriceAlert, db: AsyncSession):
        """Check individual price alert"""
        
        try:
            # Get current asset price
            asset = await db.get(Asset, alert.asset_id)
            if not asset:
                logger.warning(f"Asset {alert.asset_id} not found for alert {alert.id}")
                return
            
            current_price = float(asset.current_price)
            should_trigger = False
            
            # Check alert condition
            if alert.condition_type == PriceAlertCondition.ABOVE:
                should_trigger = current_price > alert.target_price
            elif alert.condition_type == PriceAlertCondition.BELOW:
                should_trigger = current_price < alert.target_price
            elif alert.condition_type == PriceAlertCondition.PERCENT_CHANGE:
                # Calculate 24h change percentage
                price_24h_ago = float(asset.price_24h_ago) if asset.price_24h_ago else current_price
                if price_24h_ago > 0:
                    change_percent = ((current_price - price_24h_ago) / price_24h_ago) * 100
                    should_trigger = abs(change_percent) >= abs(alert.change_percent)
            
            if should_trigger and alert.triggered_count < alert.max_triggers:
                await self._trigger_price_alert(alert, asset, current_price, db)
                
        except Exception as e:
            logger.error(f"Error checking price alert {alert.id}: {str(e)}")

    async def _trigger_price_alert(self, alert: PriceAlert, asset: Asset, current_price: float, db: AsyncSession):
        """Trigger price alert"""
        
        try:
            # Update alert
            alert.triggered_count += 1
            alert.last_triggered_at = datetime.utcnow()
            
            if not alert.is_recurring and alert.triggered_count >= alert.max_triggers:
                alert.is_active = False
            
            # Create notification
            title = f"💰 Ценовое уведомление: {asset.symbol.upper()}"
            
            if alert.condition_type == PriceAlertCondition.ABOVE:
                message = f"{asset.name} ({asset.symbol.upper()}) выше ${alert.target_price:.4f}\nТекущая цена: ${current_price:.4f}"
            elif alert.condition_type == PriceAlertCondition.BELOW:
                message = f"{asset.name} ({asset.symbol.upper()}) ниже ${alert.target_price:.4f}\nТекущая цена: ${current_price:.4f}"
            else:
                price_24h_ago = float(asset.price_24h_ago) if asset.price_24h_ago else current_price
                change_percent = ((current_price - price_24h_ago) / price_24h_ago) * 100 if price_24h_ago > 0 else 0
                message = f"{asset.name} ({asset.symbol.upper()}) изменилась на {change_percent:.2f}%\nТекущая цена: ${current_price:.4f}"
            
            channels = []
            if alert.notify_telegram:
                channels.append("telegram")
            if alert.notify_email:
                channels.append("email")
            channels.append("in_app")
            
            notification = Notification(
                user_id=alert.user_id,
                type=NotificationType.PRICE_ALERT,
                title=title,
                message=message,
                priority="high",
                is_actionable=True,
                action_url=f"/trading/{asset.symbol}",
                channels=channels,
                metadata={
                    "alert_id": alert.id,
                    "asset_id": asset.id,
                    "asset_symbol": asset.symbol,
                    "trigger_price": current_price,
                    "target_price": alert.target_price
                }
            )
            
            db.add(notification)
            await db.commit()
            await db.refresh(notification)
            
            # Send notification
            await self.send_notification(notification, db)
            
            logger.info(f"Price alert {alert.id} triggered for user {alert.user_id}")
            
        except Exception as e:
            logger.error(f"Error triggering price alert {alert.id}: {str(e)}")

    async def send_trading_notification(
        self,
        user_id: str,
        order_type: str,
        asset_symbol: str,
        amount: float,
        price: float,
        status: str,
        db: Optional[AsyncSession] = None
    ):
        """Send trading-related notification"""
        
        title = f"📊 {order_type.upper()} ордер {asset_symbol.upper()}"
        
        if status == "completed":
            emoji = "✅"
            action = "выполнен"
        elif status == "cancelled":
            emoji = "❌"
            action = "отменен"
        elif status == "pending":
            emoji = "⏳"
            action = "ожидает выполнения"
        else:
            emoji = "ℹ️"
            action = status
        
        message = f"{emoji} Ваш {order_type} ордер {action}\n"
        message += f"Актив: {asset_symbol.upper()}\n"
        message += f"Количество: {amount:.8f}\n"
        message += f"Цена: ${price:.4f}"
        
        await self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=NotificationType.TRADING,
            priority="normal",
            is_actionable=True,
            action_url="/portfolio",
            channels=["telegram", "in_app"],
            metadata={
                "order_type": order_type,
                "asset_symbol": asset_symbol,
                "amount": amount,
                "price": price,
                "status": status
            },
            db=db
        )

    async def send_transaction_notification(
        self,
        user_id: str,
        transaction_type: str,
        amount: float,
        status: str,
        db: Optional[AsyncSession] = None
    ):
        """Send transaction-related notification"""
        
        if transaction_type == "deposit":
            title = "💰 Пополнение счета"
            emoji = "💰"
        else:
            title = "💸 Вывод средств"
            emoji = "💸"
        
        if status == "completed":
            action = "выполнено"
            priority = "normal"
        elif status == "pending":
            action = "обрабатывается"
            priority = "normal"
        elif status == "failed":
            action = "отклонено"
            priority = "high"
        else:
            action = status
            priority = "normal"
        
        message = f"{emoji} {title} {action}\n"
        message += f"Сумма: ${amount:.2f}"
        
        await self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=NotificationType.TRANSACTION,
            priority=priority,
            is_actionable=True,
            action_url="/transactions",
            channels=["telegram", "in_app"],
            metadata={
                "transaction_type": transaction_type,
                "amount": amount,
                "status": status
            },
            db=db
        )

    async def send_admin_notification(
        self,
        message: str,
        title: str = "📢 Системное уведомление",
        priority: str = "normal",
        user_filter: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None
    ):
        """Send notification from admin to users"""
        
        if not db:
            async for session in get_async_db():
                db = session
                break
        
        # Get target users
        query = select(User).where(User.status == "active")
        
        if user_filter:
            # Apply filters (could be enhanced)
            if "user_type" in user_filter:
                query = query.where(User.user_type == user_filter["user_type"])
        
        result = await db.execute(query)
        users = result.scalars().all()
        
        notifications_created = 0
        for user in users:
            await self.create_notification(
                user_id=user.id,
                title=title,
                message=message,
                notification_type=NotificationType.NEWS,
                priority=priority,
                channels=["telegram", "in_app"],
                db=db
            )
            notifications_created += 1
        
        return notifications_created


# Global notification service instance
notification_service = NotificationService()
