"""
Pydantic schemas for API endpoints
"""

from .users import *
from .trading import *
from .admin import *
from .notifications import *

__all__ = [
    # User schemas
    "UserResponse", "UserUpdate", "UserCreate", "UserListResponse",
    "PortfolioResponse", "TransactionHistoryResponse", "UserStatsResponse",

    # Trading schemas
    "AssetResponse", "AssetCreate", "AssetUpdate", "AssetListResponse",
    "OrderResponse", "OrderCreate", "OrderListResponse",
    "TransactionResponse", "TransactionCreate",
    "PriceHistoryResponse", "MarketStatsResponse",
    "PortfolioItemResponse", "PortfolioStatsResponse",

    # Admin schemas
    "AdminDashboardResponse", "AdminStatsResponse",
    "AdminUserResponse", "AdminUserUpdate",
    "AdminTransactionResponse", "WithdrawalApprovalRequest",
    "AdminAssetResponse", "AdminAssetUpdate", "AdminAssetCreate",
    "PlatformSettingsResponse", "PlatformSettingsUpdate",
    "AuditLogResponse", "AdminNotificationCreate",

    # Notification schemas
    "NotificationResponse", "NotificationCreate", "NotificationUpdate", "NotificationListResponse",
    "PriceAlertResponse", "PriceAlertCreate", "PriceAlertUpdate",
    "AdminNotificationStats", "BroadcastRequest", "BroadcastResponse",
    "TelegramNotificationData", "EmailNotificationData", "PushNotificationData",
    "NotificationPreferences", "NotificationPreferencesUpdate",
    "NotificationTemplate", "NotificationTemplateCreate", "NotificationTemplateUpdate", "NotificationTemplateResponse",
]
