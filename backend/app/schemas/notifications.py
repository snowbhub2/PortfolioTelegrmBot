"""
Notification-related Pydantic schemas
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

from app.models.notifications import NotificationType, NotificationStatus, PriceAlertCondition


# ================ NOTIFICATION SCHEMAS ================

class NotificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    type: Optional[NotificationType] = None
    priority: str = Field(default="normal", regex="^(low|normal|high|urgent)$")
    is_actionable: bool = False
    action_url: Optional[str] = None
    channels: List[str] = Field(default=["in_app"])
    metadata: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None
    priority: Optional[str] = None
    is_actionable: Optional[bool] = None
    action_url: Optional[str] = None


class NotificationResponse(NotificationBase):
    id: str
    user_id: str
    status: NotificationStatus
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    limit: int
    offset: int


# ================ PRICE ALERT SCHEMAS ================

class PriceAlertBase(BaseModel):
    asset_id: str
    condition_type: PriceAlertCondition
    target_price: Optional[float] = None
    change_percent: Optional[float] = None
    is_recurring: bool = False
    max_triggers: int = 1
    notify_telegram: bool = True
    notify_email: bool = False


class PriceAlertCreate(PriceAlertBase):
    pass


class PriceAlertUpdate(BaseModel):
    condition_type: Optional[PriceAlertCondition] = None
    target_price: Optional[float] = None
    change_percent: Optional[float] = None
    is_active: Optional[bool] = None
    is_recurring: Optional[bool] = None
    max_triggers: Optional[int] = None
    notify_telegram: Optional[bool] = None
    notify_email: Optional[bool] = None


class PriceAlertResponse(PriceAlertBase):
    id: str
    user_id: str
    is_active: bool
    triggered_count: int
    last_triggered_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ================ ADMIN NOTIFICATION SCHEMAS ================

class AdminNotificationStats(BaseModel):
    total_notifications: int
    sent_notifications: int
    unread_notifications: int
    active_price_alerts: int
    delivery_rate: float


class BroadcastRequest(NotificationBase):
    user_filter: Optional[Dict[str, Any]] = None  # For filtering users
    schedule_at: Optional[datetime] = None  # For scheduling


class BroadcastResponse(BaseModel):
    message: str
    recipients: int
    broadcast_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None


# ================ NOTIFICATION CHANNEL SCHEMAS ================

class TelegramNotificationData(BaseModel):
    chat_id: str
    message_id: Optional[str] = None
    reply_markup: Optional[Dict[str, Any]] = None


class EmailNotificationData(BaseModel):
    email: str
    subject: str
    template: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None


class PushNotificationData(BaseModel):
    device_token: str
    badge_count: Optional[int] = None
    sound: Optional[str] = None


# ================ NOTIFICATION PREFERENCE SCHEMAS ================

class NotificationPreferences(BaseModel):
    telegram_enabled: bool = True
    email_enabled: bool = False
    push_enabled: bool = True
    trading_alerts: bool = True
    price_alerts: bool = True
    news_updates: bool = True
    admin_messages: bool = True
    marketing_messages: bool = False


class NotificationPreferencesUpdate(BaseModel):
    telegram_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    trading_alerts: Optional[bool] = None
    price_alerts: Optional[bool] = None
    news_updates: Optional[bool] = None
    admin_messages: Optional[bool] = None
    marketing_messages: Optional[bool] = None


# ================ NOTIFICATION TEMPLATE SCHEMAS ================

class NotificationTemplate(BaseModel):
    name: str
    type: NotificationType
    title_template: str
    message_template: str
    channels: List[str]
    variables: List[str]
    is_active: bool = True


class NotificationTemplateCreate(NotificationTemplate):
    pass


class NotificationTemplateUpdate(BaseModel):
    title_template: Optional[str] = None
    message_template: Optional[str] = None
    channels: Optional[List[str]] = None
    variables: Optional[List[str]] = None
    is_active: Optional[bool] = None


class NotificationTemplateResponse(NotificationTemplate):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    usage_count: int = 0

    class Config:
        from_attributes = True
