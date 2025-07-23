"""
Database connection and session management
"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
import asyncio
import logging

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Create engines
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

async_engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Create session makers
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


def get_db() -> Session:
    """Get database session (sync)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncSession:
    """Get async database session"""
    async with AsyncSessionLocal() as session:
        yield session


async def create_tables():
    """Create all database tables"""
    try:
        # Import all models to ensure they are registered with SQLModel
        from app.models import (
            User, UserSession, UserLoginAttempt, KYCDocument,
            Asset, Portfolio, Transaction, Order, OrderFill, PriceHistory, TradingPair,
            Notification, NotificationTemplate, PriceAlert, SupportTicket, SupportMessage,
            PlatformSettings, MaintenanceMode, AuditLog, SystemMetrics, ApiKey, FeatureFlag
        )
        
        async with async_engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        
        logger.info("Database tables created successfully")
        
        # Initialize default data
        await initialize_default_data()
        
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


async def initialize_default_data():
    """Initialize default data for the platform"""
    async with AsyncSessionLocal() as session:
        try:
            # Import models
            from app.models import User, Asset, PlatformSettings, NotificationTemplate
            from app.models.user import UserRole
            from app.models.trading import AssetType
            from app.models.notifications import NotificationType, NotificationChannel
            
            # Create admin user if not exists
            admin_user = await session.get(User, {"telegram_id": settings.TELEGRAM_ADMIN_ID})
            if not admin_user:
                admin_user = User(
                    telegram_id=settings.TELEGRAM_ADMIN_ID,
                    username="admin",
                    first_name="Admin",
                    last_name="User",
                    role=UserRole.ADMIN,
                    email="admin@platform.com"
                )
                session.add(admin_user)
                logger.info("Created admin user")
            
            # Create default assets
            default_assets = [
                {
                    "symbol": "BTC",
                    "name": "Bitcoin",
                    "description": "The first and most popular cryptocurrency",
                    "asset_type": AssetType.CRYPTO,
                    "current_price": 45000.0,
                    "alpha_vantage_symbol": "BTC",
                    "alpha_vantage_function": "DIGITAL_CURRENCY_DAILY"
                },
                {
                    "symbol": "ETH",
                    "name": "Ethereum",
                    "description": "Smart contract platform and cryptocurrency",
                    "asset_type": AssetType.CRYPTO,
                    "current_price": 3000.0,
                    "alpha_vantage_symbol": "ETH",
                    "alpha_vantage_function": "DIGITAL_CURRENCY_DAILY"
                },
                {
                    "symbol": "USDT",
                    "name": "Tether",
                    "description": "USD-pegged stablecoin",
                    "asset_type": AssetType.CRYPTO,
                    "current_price": 1.0,
                    "is_trending": False
                },
                {
                    "symbol": "AAPL",
                    "name": "Apple Inc.",
                    "description": "Technology company",
                    "asset_type": AssetType.STOCK,
                    "current_price": 180.0,
                    "alpha_vantage_symbol": "AAPL",
                    "alpha_vantage_function": "TIME_SERIES_DAILY"
                },
                {
                    "symbol": "GOOGL",
                    "name": "Alphabet Inc.",
                    "description": "Technology company",
                    "asset_type": AssetType.STOCK,
                    "current_price": 140.0,
                    "alpha_vantage_symbol": "GOOGL",
                    "alpha_vantage_function": "TIME_SERIES_DAILY"
                }
            ]
            
            for asset_data in default_assets:
                existing_asset = await session.get(Asset, {"symbol": asset_data["symbol"]})
                if not existing_asset:
                    asset = Asset(**asset_data)
                    session.add(asset)
            
            # Create default platform settings
            default_settings = [
                {"key": "trading_enabled", "value": "true", "category": "trading", "data_type": "bool", "is_public": True},
                {"key": "maintenance_mode", "value": "false", "category": "system", "data_type": "bool", "is_public": True},
                {"key": "min_deposit_amount", "value": "10.0", "category": "trading", "data_type": "float", "is_public": True},
                {"key": "max_deposit_amount", "value": "100000.0", "category": "trading", "data_type": "float", "is_public": True},
                {"key": "min_withdrawal_amount", "value": "20.0", "category": "trading", "data_type": "float", "is_public": True},
                {"key": "max_withdrawal_amount", "value": "50000.0", "category": "trading", "data_type": "float", "is_public": True},
                {"key": "trading_fee_percentage", "value": "0.1", "category": "trading", "data_type": "float", "is_public": True},
                {"key": "withdrawal_fee_percentage", "value": "0.5", "category": "trading", "data_type": "float", "is_public": True},
                {"key": "kyc_required", "value": "false", "category": "security", "data_type": "bool", "is_public": True},
                {"key": "two_factor_required", "value": "false", "category": "security", "data_type": "bool", "is_public": True},
            ]
            
            for setting_data in default_settings:
                existing_setting = await session.get(PlatformSettings, {"key": setting_data["key"]})
                if not existing_setting:
                    setting = PlatformSettings(**setting_data)
                    session.add(setting)
            
            # Create notification templates
            notification_templates = [
                {
                    "type": NotificationType.TRADE_EXECUTED,
                    "name": "Trade Executed",
                    "title_template": "Trade Executed",
                    "message_template": "Your {side} order for {quantity} {asset} has been executed at {price}",
                    "default_channels": [NotificationChannel.TELEGRAM, NotificationChannel.IN_APP]
                },
                {
                    "type": NotificationType.DEPOSIT_COMPLETED,
                    "name": "Deposit Completed",
                    "title_template": "Deposit Completed",
                    "message_template": "Your deposit of {amount} {asset} has been completed",
                    "default_channels": [NotificationChannel.TELEGRAM, NotificationChannel.IN_APP]
                },
                {
                    "type": NotificationType.WITHDRAWAL_COMPLETED,
                    "name": "Withdrawal Completed",
                    "title_template": "Withdrawal Completed",
                    "message_template": "Your withdrawal of {amount} {asset} has been completed",
                    "default_channels": [NotificationChannel.TELEGRAM, NotificationChannel.IN_APP]
                }
            ]
            
            for template_data in notification_templates:
                existing_template = await session.get(NotificationTemplate, {"type": template_data["type"]})
                if not existing_template:
                    template = NotificationTemplate(**template_data)
                    session.add(template)
            
            await session.commit()
            logger.info("Default data initialized successfully")
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error initializing default data: {e}")
            raise


async def close_db_connections():
    """Close database connections"""
    await async_engine.dispose()
    engine.dispose()
    logger.info("Database connections closed")
