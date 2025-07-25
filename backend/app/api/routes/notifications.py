"""
Notifications API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, desc
from typing import List, Optional
from datetime import datetime

from app.core.security import get_current_user, get_current_admin_user
from app.db.database import get_async_db
from app.models import User, Notification, PriceAlert
from app.models.notifications import NotificationStatus, NotificationType
from app.schemas.notifications import (
    NotificationResponse, NotificationCreate, NotificationUpdate,
    PriceAlertResponse, PriceAlertCreate, NotificationListResponse
)
from app.services.notification import notification_service

router = APIRouter()


# ================ USER NOTIFICATIONS ================

@router.get("/", response_model=NotificationListResponse)
async def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    notification_type: Optional[NotificationType] = None
):
    """Get user's notifications"""
    
    query = select(Notification).where(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.where(Notification.is_read == False)
    
    if notification_type:
        query = query.where(Notification.type == notification_type)
    
    # Get total count
    total_result = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id).count()
    )
    total = total_result.scalar()
    
    # Get unread count
    unread_result = await db.execute(
        select(Notification).where(
            and_(
                Notification.user_id == current_user.id,
                Notification.is_read == False
            )
        ).count()
    )
    unread_count = unread_result.scalar()
    
    # Get paginated results
    query = query.order_by(desc(Notification.created_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return NotificationListResponse(
        notifications=notifications,
        total=total,
        unread_count=unread_count,
        limit=limit,
        offset=offset
    )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get specific notification"""
    
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check ownership
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this notification")
    
    return notification


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Mark notification as read"""
    
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check ownership
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this notification")
    
    # Mark as read
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(notification)
    
    return notification


@router.put("/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Mark all notifications as read"""
    
    # Update all unread notifications
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.user_id == current_user.id,
                Notification.is_read == False
            )
        )
    )
    notifications = result.scalars().all()
    
    for notification in notifications:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": f"Marked {len(notifications)} notifications as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete notification"""
    
    notification = await db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Check ownership
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this notification")
    
    await db.delete(notification)
    await db.commit()
    
    return {"message": "Notification deleted successfully"}


# ================ PRICE ALERTS ================

@router.get("/price-alerts", response_model=List[PriceAlertResponse])
async def get_price_alerts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    is_active: Optional[bool] = None
):
    """Get user's price alerts"""
    
    query = select(PriceAlert).where(PriceAlert.user_id == current_user.id)
    
    if is_active is not None:
        query = query.where(PriceAlert.is_active == is_active)
    
    query = query.order_by(desc(PriceAlert.created_at))
    
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    return alerts


@router.post("/price-alerts", response_model=PriceAlertResponse)
async def create_price_alert(
    alert_create: PriceAlertCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create price alert"""
    
    # Validate asset exists
    from app.models import Asset
    asset = await db.get(Asset, alert_create.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Create alert
    alert = PriceAlert(
        user_id=current_user.id,
        asset_id=alert_create.asset_id,
        condition_type=alert_create.condition_type,
        target_price=alert_create.target_price,
        change_percent=alert_create.change_percent,
        is_recurring=alert_create.is_recurring,
        max_triggers=alert_create.max_triggers,
        notify_telegram=alert_create.notify_telegram,
        notify_email=alert_create.notify_email
    )
    
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    
    return alert


@router.put("/price-alerts/{alert_id}", response_model=PriceAlertResponse)
async def update_price_alert(
    alert_id: str,
    alert_update: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update price alert"""
    
    alert = await db.get(PriceAlert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Price alert not found")
    
    # Check ownership
    if alert.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this alert")
    
    # Update fields
    for field, value in alert_update.items():
        if hasattr(alert, field) and field not in ['id', 'user_id', 'created_at']:
            setattr(alert, field, value)
    
    await db.commit()
    await db.refresh(alert)
    
    return alert


@router.delete("/price-alerts/{alert_id}")
async def delete_price_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Delete price alert"""
    
    alert = await db.get(PriceAlert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Price alert not found")
    
    # Check ownership
    if alert.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this alert")
    
    await db.delete(alert)
    await db.commit()
    
    return {"message": "Price alert deleted successfully"}


# ================ ADMIN NOTIFICATIONS ================

@router.post("/admin/broadcast")
async def broadcast_notification(
    notification_data: NotificationCreate,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Broadcast notification to all users (Admin only)"""
    
    try:
        # Get all active users
        result = await db.execute(
            select(User).where(User.status == "active")
        )
        users = result.scalars().all()
        
        # Create notifications for all users
        notifications_created = 0
        for user in users:
            notification = Notification(
                user_id=user.id,
                type=notification_data.type or NotificationType.NEWS,
                title=notification_data.title,
                message=notification_data.message,
                priority=notification_data.priority or "normal",
                is_actionable=notification_data.is_actionable or False,
                action_url=notification_data.action_url,
                channels=notification_data.channels or ["telegram", "in_app"]
            )
            
            db.add(notification)
            notifications_created += 1
        
        await db.commit()
        
        return {
            "message": f"Broadcast sent to {notifications_created} users",
            "recipients": notifications_created
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error broadcasting notification: {str(e)}")


@router.post("/admin/send")
async def send_admin_notification(
    user_id: str,
    notification_data: NotificationCreate,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Send notification to specific user (Admin only)"""
    
    # Validate user exists
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create notification
    notification = Notification(
        user_id=user_id,
        type=notification_data.type or NotificationType.NEWS,
        title=notification_data.title,
        message=notification_data.message,
        priority=notification_data.priority or "normal",
        is_actionable=notification_data.is_actionable or False,
        action_url=notification_data.action_url,
        channels=notification_data.channels or ["telegram", "in_app"]
    )
    
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    
    # Send via notification service
    await notification_service.send_notification(notification)
    
    return {
        "message": "Notification sent successfully",
        "notification_id": notification.id
    }


@router.get("/admin/stats")
async def get_notification_stats(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get notification statistics (Admin only)"""
    
    # Total notifications
    total_result = await db.execute(select(Notification).count())
    total_notifications = total_result.scalar()
    
    # Sent notifications
    sent_result = await db.execute(
        select(Notification).where(Notification.status == NotificationStatus.SENT).count()
    )
    sent_notifications = sent_result.scalar()
    
    # Unread notifications
    unread_result = await db.execute(
        select(Notification).where(Notification.is_read == False).count()
    )
    unread_notifications = unread_result.scalar()
    
    # Active price alerts
    active_alerts_result = await db.execute(
        select(PriceAlert).where(PriceAlert.is_active == True).count()
    )
    active_alerts = active_alerts_result.scalar()
    
    return {
        "total_notifications": total_notifications,
        "sent_notifications": sent_notifications,
        "unread_notifications": unread_notifications,
        "active_price_alerts": active_alerts,
        "delivery_rate": (sent_notifications / total_notifications * 100) if total_notifications > 0 else 0
    }
