"""
Telegram Bot service for notifications and user interactions
"""

import asyncio
import logging
from typing import Optional, Dict, Any, List
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command, Text
from aiogram.types import (
    Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo, MenuButtonWebApp
)
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError
import json

from app.core.config import get_settings
from app.models import User, Notification, Transaction, Asset
from app.models.user import UserRole
from app.models.notifications import NotificationType
from app.db.database import AsyncSessionLocal
from sqlmodel import select

settings = get_settings()
logger = logging.getLogger(__name__)


class TelegramBotService:
    """Service for Telegram Bot integration"""
    
    def __init__(self):
        self.bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
        self.dp = Dispatcher()
        self.is_running = False
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup bot command handlers"""
        
        @self.dp.message(Command("start"))
        async def start_handler(message: Message):
            await self.handle_start_command(message)
        
        @self.dp.message(Command("help"))
        async def help_handler(message: Message):
            await self.handle_help_command(message)
        
        @self.dp.message(Command("balance"))
        async def balance_handler(message: Message):
            await self.handle_balance_command(message)
        
        @self.dp.message(Command("portfolio"))
        async def portfolio_handler(message: Message):
            await self.handle_portfolio_command(message)
        
        @self.dp.message(Command("admin"))
        async def admin_handler(message: Message):
            await self.handle_admin_command(message)
        
        @self.dp.callback_query(Text(startswith="action_"))
        async def callback_handler(callback: CallbackQuery):
            await self.handle_callback_query(callback)
    
    async def start(self):
        """Start the bot service"""
        try:
            # Set bot menu button to web app
            web_app = WebAppInfo(url="https://your-domain.com")  # Replace with actual domain
            menu_button = MenuButtonWebApp(text="Open Trading App", web_app=web_app)
            await self.bot.set_chat_menu_button(menu_button=menu_button)
            
            # Start polling in background
            self.is_running = True
            asyncio.create_task(self._polling_loop())
            
            logger.info("Telegram bot service started")
            
        except Exception as e:
            logger.error(f"Failed to start Telegram bot: {e}")
            raise
    
    async def stop(self):
        """Stop the bot service"""
        self.is_running = False
        await self.bot.session.close()
        logger.info("Telegram bot service stopped")
    
    async def _polling_loop(self):
        """Main polling loop"""
        try:
            await self.dp.start_polling(self.bot)
        except Exception as e:
            logger.error(f"Error in polling loop: {e}")
    
    async def handle_start_command(self, message: Message):
        """Handle /start command"""
        try:
            # Get or create user
            user = await self.get_or_create_user(message.from_user)
            
            # Create welcome message
            welcome_text = f"""
🚀 **Добро пожаловать в Crypto Trading Platform!**

Привет, {user.first_name}! 👋

Ваш аккаунт успешно создан и готов к использованию.

📱 **Основные функции:**
• Торговля криптовалютами
• Управление портфелем
• Депозиты и выводы
• Реальные цены активов

🔧 **Команды:**
/balance - Проверить баланс
/portfolio - Показать портфель
/help - Список всех команд

Нажмите кнопку ниже, чтобы открыть торговое приложение:
            """
            
            # Create keyboard with web app button
            keyboard = InlineKeyboardMarkup(
                inline_keyboard=[[
                    InlineKeyboardButton(
                        text="🚀 Открыть Приложение",
                        web_app=WebAppInfo(url="https://your-domain.com")
                    )
                ]]
            )
            
            await message.answer(welcome_text, reply_markup=keyboard, parse_mode="Markdown")
            
            # Send notification to admins about new user
            if user.role == UserRole.USER:  # Don't notify for admin
                await self.notify_admins_new_user(user)
            
        except Exception as e:
            logger.error(f"Error handling start command: {e}")
            await message.answer("Произошла ошибка. Попробуйте позже.")
    
    async def handle_help_command(self, message: Message):
        """Handle /help command"""
        help_text = """
🤖 **Список команд Crypto Trading Platform**

**Основные команды:**
/start - Начать работу с ботом
/balance - Проверить баланс всех активов
/portfolio - Показать портфель с P&L
/help - Показать это сообщение

**Админ команды:**
/admin - Админ панель (только для администраторов)

**Веб-приложение:**
Используйте кнопку меню или команду /start для доступа к полному функционалу платформы.

**Поддержка:**
Е��ли у вас есть вопросы, обратитесь в поддержку: @platform_support
        """
        
        await message.answer(help_text, parse_mode="Markdown")
    
    async def handle_balance_command(self, message: Message):
        """Handle /balance command"""
        try:
            # Get user
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(User).where(User.telegram_id == message.from_user.id)
                )
                user = result.scalar_one_or_none()
                
                if not user:
                    await message.answer("❌ Пользователь не найден. Используйте /start")
                    return
                
                # Get portfolio
                from app.services.trading import trading_service
                portfolio = await trading_service.get_user_portfolio(user.id, db)
                stats = await trading_service.get_portfolio_stats(user.id, db)
                
                if not portfolio:
                    await message.answer("💰 **Ваш баланс пуст**\n\nИспользуйте приложение для пополнения счета.")
                    return
                
                # Format portfolio message
                balance_text = f"""
💰 **Ваш баланс**

📊 **Общая статистика:**
💎 Общая стоимость: ${stats['total_value']:,.2f}
📈 P&L: ${stats['total_pnl']:,.2f} ({stats['total_pnl_percent']:.2f}%)
🎯 Активов: {stats['asset_count']}

💼 **Активы:**
                """
                
                for item in portfolio[:10]:  # Show top 10 assets
                    symbol = item['asset_symbol']
                    quantity = item['quantity']
                    value = item['market_value']
                    pnl_percent = item.get('pnl_percent', 0)
                    
                    pnl_emoji = "📈" if pnl_percent >= 0 else "📉"
                    balance_text += f"\n{pnl_emoji} {symbol}: {quantity} (${value:,.2f})"
                
                if len(portfolio) > 10:
                    balance_text += f"\n\n... и еще {len(portfolio) - 10} активов"
                
                balance_text += "\n\n🚀 Открыть приложение для детального просмотра"
                
                # Add web app button
                keyboard = InlineKeyboardMarkup(
                    inline_keyboard=[[
                        InlineKeyboardButton(
                            text="📱 Открыть Приложение",
                            web_app=WebAppInfo(url="https://your-domain.com")
                        )
                    ]]
                )
                
                await message.answer(balance_text, reply_markup=keyboard, parse_mode="Markdown")
                
        except Exception as e:
            logger.error(f"Error handling balance command: {e}")
            await message.answer("❌ Ошибка получения баланса. Попробуйте позже.")
    
    async def handle_portfolio_command(self, message: Message):
        """Handle /portfolio command"""
        # Similar to balance but with more detailed P&L info
        await self.handle_balance_command(message)
    
    async def handle_admin_command(self, message: Message):
        """Handle /admin command"""
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(User).where(User.telegram_id == message.from_user.id)
                )
                user = result.scalar_one_or_none()
                
                if not user or user.role != UserRole.ADMIN:
                    await message.answer("❌ У вас нет прав администратора.")
                    return
                
                # Get admin stats
                total_users_result = await db.execute(select(User).count())
                total_users = total_users_result.scalar()
                
                active_users_result = await db.execute(
                    select(User).where(User.status == "active").count()
                )
                active_users = active_users_result.scalar()
                
                pending_withdrawals_result = await db.execute(
                    select(Transaction).where(
                        Transaction.type == "withdrawal",
                        Transaction.status == "pending"
                    ).count()
                )
                pending_withdrawals = pending_withdrawals_result.scalar()
                
                admin_text = f"""
👑 **Админ Панель**

📊 **Статистика платформы:**
👥 Всего пользователей: {total_users}
✅ Активных: {active_users}
⏳ Ожидающих выводов: {pending_withdrawals}

🔧 **Быстрые действия:**
                """
                
                keyboard = InlineKeyboardMarkup(
                    inline_keyboard=[
                        [
                            InlineKeyboardButton(
                                text="🌐 Админ Панель",
                                web_app=WebAppInfo(url="https://your-domain.com/admin")
                            )
                        ],
                        [
                            InlineKeyboardButton(
                                text="📈 Статистика",
                                callback_data="action_admin_stats"
                            ),
                            InlineKeyboardButton(
                                text="💳 Выводы",
                                callback_data="action_admin_withdrawals"
                            )
                        ]
                    ]
                )
                
                await message.answer(admin_text, reply_markup=keyboard, parse_mode="Markdown")
                
        except Exception as e:
            logger.error(f"Error handling admin command: {e}")
            await message.answer("❌ Ошибка доступа к админ панели.")
    
    async def handle_callback_query(self, callback: CallbackQuery):
        """Handle inline keyboard callbacks"""
        try:
            action = callback.data
            
            if action == "action_admin_stats":
                await self.send_admin_stats(callback.message.chat.id)
            elif action == "action_admin_withdrawals":
                await self.send_pending_withdrawals(callback.message.chat.id)
            
            await callback.answer()
            
        except Exception as e:
            logger.error(f"Error handling callback: {e}")
            await callback.answer("Ошибка обработки запроса")
    
    async def get_or_create_user(self, telegram_user: types.User) -> User:
        """Get or create user from Telegram user data"""
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(User).where(User.telegram_id == telegram_user.id)
            )
            user = result.scalar_one_or_none()
            
            if user:
                # Update user data
                user.first_name = telegram_user.first_name
                user.last_name = telegram_user.last_name
                user.username = telegram_user.username
                user.language_code = telegram_user.language_code or "en"
                user.is_premium = telegram_user.is_premium or False
                user.last_active = datetime.utcnow()
                
            else:
                # Create new user
                user_role = UserRole.ADMIN if telegram_user.id == settings.TELEGRAM_ADMIN_ID else UserRole.USER
                
                user = User(
                    telegram_id=telegram_user.id,
                    first_name=telegram_user.first_name,
                    last_name=telegram_user.last_name,
                    username=telegram_user.username,
                    language_code=telegram_user.language_code or "en",
                    is_premium=telegram_user.is_premium or False,
                    role=user_role
                )
                
                db.add(user)
                logger.info(f"Created new user: {telegram_user.id} ({telegram_user.username})")
            
            await db.commit()
            await db.refresh(user)
            
            return user
    
    async def send_message_to_user(self, telegram_id: int, message: str) -> bool:
        """Send message to specific user"""
        try:
            await self.bot.send_message(chat_id=telegram_id, text=message, parse_mode="Markdown")
            return True
        except (TelegramBadRequest, TelegramForbiddenError) as e:
            logger.warning(f"Cannot send message to user {telegram_id}: {e}")
            return False
        except Exception as e:
            logger.error(f"Error sending message to user {telegram_id}: {e}")
            return False
    
    async def send_notification(self, notification: Notification):
        """Send notification via Telegram"""
        try:
            # Get user
            async with AsyncSessionLocal() as db:
                user = await db.get(User, notification.user_id)
                if not user:
                    return False
                
                # Format message
                message_text = f"📢 **{notification.title}**\n\n{notification.message}"
                
                # Add action button if actionable
                keyboard = None
                if notification.is_actionable and notification.action_url:
                    keyboard = InlineKeyboardMarkup(
                        inline_keyboard=[[
                            InlineKeyboardButton(
                                text="🔗 Открыть",
                                url=notification.action_url
                            )
                        ]]
                    )
                
                success = await self.send_message_to_user(
                    user.telegram_id, 
                    message_text
                )
                
                if success:
                    notification.status = "sent"
                    notification.sent_at = datetime.utcnow()
                else:
                    notification.status = "failed"
                
                await db.commit()
                return success
                
        except Exception as e:
            logger.error(f"Error sending notification {notification.id}: {e}")
            return False
    
    async def notify_admins_new_user(self, user: User):
        """Notify admins about new user registration"""
        try:
            async with AsyncSessionLocal() as db:
                # Get all admin users
                result = await db.execute(
                    select(User).where(User.role == UserRole.ADMIN)
                )
                admins = result.scalars().all()
                
                message = f"""
🆕 **Новый пользователь зарегистрирован**

👤 Имя: {user.first_name} {user.last_name or ""}
🆔 Username: @{user.username or "не указан"}
🆔 Telegram ID: {user.telegram_id}
🌍 Язык: {user.language_code}
⭐ Premium: {"Да" if user.is_premium else "Нет"}
📅 Дата: {user.created_at.strftime("%d.%m.%Y %H:%M")}
                """
                
                for admin in admins:
                    await self.send_message_to_user(admin.telegram_id, message)
                    
        except Exception as e:
            logger.error(f"Error notifying admins about new user: {e}")
    
    async def notify_transaction_completed(self, transaction: Transaction):
        """Notify user about completed transaction"""
        try:
            async with AsyncSessionLocal() as db:
                user = await db.get(User, transaction.user_id)
                if not user:
                    return
                
                # Get asset info
                asset = None
                if transaction.asset_id:
                    asset = await db.get(Asset, transaction.asset_id)
                
                # Format message based on transaction type
                if transaction.type == "deposit":
                    emoji = "💰"
                    action = "пополнение"
                elif transaction.type == "withdrawal":
                    emoji = "💸"
                    action = "вывод"
                else:
                    emoji = "💱"
                    action = "операция"
                
                asset_name = asset.symbol if asset else "USD"
                
                message = f"""
{emoji} **{action.title()} завершен**

💎 Актив: {asset_name}
💵 Сумма: {transaction.amount}
💳 Комиссия: {transaction.fee}
🆔 ID: {transaction.id[:8]}...
📅 Время: {transaction.completed_at.strftime("%d.%m.%Y %H:%M") if transaction.completed_at else "Сейчас"}

✅ Операция успешно обработана!
                """
                
                await self.send_message_to_user(user.telegram_id, message)
                
        except Exception as e:
            logger.error(f"Error notifying transaction completion: {e}")
    
    async def send_admin_stats(self, chat_id: int):
        """Send admin statistics"""
        try:
            async with AsyncSessionLocal() as db:
                # Get various stats (placeholder implementation)
                message = """
📊 **Статистика платформы**

Детальная статистика доступна в веб-панели.
                """
                
                keyboard = InlineKeyboardMarkup(
                    inline_keyboard=[[
                        InlineKeyboardButton(
                            text="🌐 Открыть Админ Панель",
                            web_app=WebAppInfo(url="https://your-domain.com/admin")
                        )
                    ]]
                )
                
                await self.bot.send_message(
                    chat_id=chat_id, 
                    text=message, 
                    reply_markup=keyboard,
                    parse_mode="Markdown"
                )
                
        except Exception as e:
            logger.error(f"Error sending admin stats: {e}")
    
    async def send_pending_withdrawals(self, chat_id: int):
        """Send pending withdrawals info"""
        try:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(Transaction)
                    .where(
                        Transaction.type == "withdrawal",
                        Transaction.status == "pending"
                    )
                    .limit(5)
                )
                withdrawals = result.scalars().all()
                
                if not withdrawals:
                    message = "✅ Нет ожидающих выводов"
                else:
                    message = f"⏳ **Ожидающие выводы ({len(withdrawals)})**\n\n"
                    
                    for withdrawal in withdrawals:
                        message += f"💸 {withdrawal.amount} USD\n"
                        message += f"👤 ID: {withdrawal.user_id[:8]}...\n"
                        message += f"📅 {withdrawal.created_at.strftime('%d.%m %H:%M')}\n\n"
                
                keyboard = InlineKeyboardMarkup(
                    inline_keyboard=[[
                        InlineKeyboardButton(
                            text="🌐 Открыть Админ Панель",
                            web_app=WebAppInfo(url="https://your-domain.com/admin/transactions")
                        )
                    ]]
                )
                
                await self.bot.send_message(
                    chat_id=chat_id, 
                    text=message, 
                    reply_markup=keyboard,
                    parse_mode="Markdown"
                )
                
        except Exception as e:
            logger.error(f"Error sending pending withdrawals: {e}")


# Global instance
telegram_bot_service = TelegramBotService()
