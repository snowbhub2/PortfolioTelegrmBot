"""
User models for the trading platform
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class UserRole(str, Enum):
    """User roles"""
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"


class UserStatus(str, Enum):
    """User status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"
    PENDING = "pending"


class VerificationLevel(str, Enum):
    """Verification levels"""
    NONE = "none"
    BASIC = "basic"
    ADVANCED = "advanced"


class RiskLevel(str, Enum):
    """Risk assessment levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class User(SQLModel, table=True):
    """User model"""
    __tablename__ = "users"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    telegram_id: int = Field(unique=True, index=True)
    username: Optional[str] = Field(default=None, index=True)
    first_name: Optional[str] = Field(default=None)
    last_name: Optional[str] = Field(default=None)
    email: Optional[str] = Field(default=None, index=True)
    phone: Optional[str] = Field(default=None)
    
    # Profile
    role: UserRole = Field(default=UserRole.USER)
    status: UserStatus = Field(default=UserStatus.ACTIVE, index=True)
    verification_level: VerificationLevel = Field(default=VerificationLevel.NONE)
    risk_level: RiskLevel = Field(default=RiskLevel.LOW)
    
    # Telegram data
    language_code: Optional[str] = Field(default="en")
    is_bot: bool = Field(default=False)
    is_premium: bool = Field(default=False)
    
    # Profile details
    country: Optional[str] = Field(default=None)
    city: Optional[str] = Field(default=None)
    timezone: Optional[str] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None)
    
    # Trading settings
    trading_enabled: bool = Field(default=True)
    notifications_enabled: bool = Field(default=True)
    two_factor_enabled: bool = Field(default=False)
    
    # Limits
    daily_withdrawal_limit: float = Field(default=10000.0)
    monthly_withdrawal_limit: float = Field(default=50000.0)
    max_trade_amount: float = Field(default=100000.0)
    
    # Statistics
    total_deposits: float = Field(default=0.0)
    total_withdrawals: float = Field(default=0.0)
    total_volume: float = Field(default=0.0)
    trades_count: int = Field(default=0)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: Optional[datetime] = Field(default=None)
    last_login: Optional[datetime] = Field(default=None)
    
    # Relationships
    portfolios: List["Portfolio"] = Relationship(back_populates="user")
    transactions: List["Transaction"] = Relationship(back_populates="user")
    orders: List["Order"] = Relationship(back_populates="user")
    notifications: List["Notification"] = Relationship(back_populates="user")
    kyc_documents: List["KYCDocument"] = Relationship(back_populates="user")


class UserSession(SQLModel, table=True):
    """User session model for tracking active sessions"""
    __tablename__ = "user_sessions"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    session_token: str = Field(unique=True, index=True)
    refresh_token: str = Field(unique=True, index=True)
    
    # Session info
    ip_address: Optional[str] = Field(default=None)
    user_agent: Optional[str] = Field(default=None)
    device_info: Optional[str] = Field(default=None)
    location: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    last_used: datetime = Field(default_factory=datetime.utcnow)
    
    is_active: bool = Field(default=True)


class UserLoginAttempt(SQLModel, table=True):
    """Track login attempts for security"""
    __tablename__ = "user_login_attempts"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    telegram_id: int = Field(index=True)
    ip_address: str
    user_agent: Optional[str] = Field(default=None)
    success: bool = Field(default=False)
    failure_reason: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class KYCDocument(SQLModel, table=True):
    """KYC document verification"""
    __tablename__ = "kyc_documents"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    
    document_type: str  # passport, id_card, driver_license, utility_bill
    document_number: Optional[str] = Field(default=None)
    file_url: str
    file_hash: str
    
    # Verification
    status: str = Field(default="pending")  # pending, approved, rejected
    verified_by: Optional[str] = Field(default=None)  # admin user id
    verification_notes: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    verified_at: Optional[datetime] = Field(default=None)
    
    # Relationship
    user: User = Relationship(back_populates="kyc_documents")
