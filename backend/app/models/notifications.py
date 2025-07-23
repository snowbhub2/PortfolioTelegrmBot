"""
Notification models
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
import uuid


class NotificationType(str, Enum):
    """Notification types"""
    TRADE_EXECUTED = "trade_executed"
    DEPOSIT_COMPLETED = "deposit_completed"
    WITHDRAWAL_COMPLETED = "withdrawal_completed"
    WITHDRAWAL_PENDING = "withdrawal_pending"
    PRICE_ALERT = "price_alert"
    SECURITY_ALERT = "security_alert"
    SYSTEM_MAINTENANCE = "system_maintenance"
    ACCOUNT_VERIFIED = "account_verified"
    ACCOUNT_SUSPENDED = "account_suspended"
    BONUS_RECEIVED = "bonus_received"
    NEWS = "news"
    PROMOTION = "promotion"


class NotificationChannel(str, Enum):
    """Notification delivery channels"""
    TELEGRAM = "telegram"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"


class NotificationStatus(str, Enum):
    """Notification delivery status"""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    READ = "read"


class Notification(SQLModel, table=True):
    """User notifications"""
    __tablename__ = "notifications"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    
    # Notification content
    type: NotificationType = Field(index=True)
    title: str
    message: str
    
    # Localization
    title_translations: Optional[Dict[str, str]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    message_translations: Optional[Dict[str, str]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Delivery
    channels: List[NotificationChannel] = Field(sa_column_kwargs={"type_": "JSON"})
    status: NotificationStatus = Field(default=NotificationStatus.PENDING, index=True)
    
    # Priority and display
    priority: str = Field(default="normal")  # low, normal, high, urgent
    is_read: bool = Field(default=False)
    is_actionable: bool = Field(default=False)
    action_url: Optional[str] = Field(default=None)
    
    # Additional data
    metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sent_at: Optional[datetime] = Field(default=None)
    delivered_at: Optional[datetime] = Field(default=None)
    read_at: Optional[datetime] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)
    
    # Relationship
    user: "User" = Relationship(back_populates="notifications")


class NotificationTemplate(SQLModel, table=True):
    """Notification templates for different events"""
    __tablename__ = "notification_templates"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    
    type: NotificationType = Field(unique=True, index=True)
    name: str
    description: Optional[str] = Field(default=None)
    
    # Template content
    title_template: str
    message_template: str
    
    # Localized templates
    templates: Dict[str, Dict[str, str]] = Field(sa_column_kwargs={"type_": "JSON"})
    
    # Settings
    default_channels: List[NotificationChannel] = Field(sa_column_kwargs={"type_": "JSON"})
    is_active: bool = Field(default=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PriceAlert(SQLModel, table=True):
    """User price alerts"""
    __tablename__ = "price_alerts"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    asset_id: str = Field(foreign_key="assets.id", index=True)
    
    # Alert conditions
    condition_type: str  # above, below, change_percent
    target_price: Optional[float] = Field(default=None)
    change_percent: Optional[float] = Field(default=None)
    
    # Alert settings
    is_active: bool = Field(default=True)
    is_recurring: bool = Field(default=False)
    max_triggers: int = Field(default=1)
    triggers_count: int = Field(default=0)
    
    # Notification settings
    notify_telegram: bool = Field(default=True)
    notify_email: bool = Field(default=False)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_triggered: Optional[datetime] = Field(default=None)


class SupportTicket(SQLModel, table=True):
    """Support tickets"""
    __tablename__ = "support_tickets"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    
    # Ticket details
    subject: str
    description: str
    category: str  # technical, financial, account, trading, other
    priority: str = Field(default="normal")  # low, normal, high, urgent
    status: str = Field(default="open", index=True)  # open, in_progress, resolved, closed
    
    # Assignment
    assigned_to: Optional[str] = Field(default=None)  # admin user id
    
    # Additional data
    attachments: Optional[List[str]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    tags: Optional[List[str]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    messages: List["SupportMessage"] = Relationship(back_populates="ticket")


class SupportMessage(SQLModel, table=True):
    """Support ticket messages"""
    __tablename__ = "support_messages"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    ticket_id: str = Field(foreign_key="support_tickets.id", index=True)
    
    # Message details
    sender_id: str  # user_id or admin_id
    sender_type: str  # user, admin
    message: str
    
    # Attachments
    attachments: Optional[List[str]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Status
    is_internal: bool = Field(default=False)  # Internal admin notes
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    ticket: SupportTicket = Relationship(back_populates="messages")
