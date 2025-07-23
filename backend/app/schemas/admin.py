"""
Pydantic schemas for admin API endpoints
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

from app.models.user import UserRole, UserStatus, VerificationLevel, RiskLevel
from app.models.trading import AssetType, TransactionType, TransactionStatus


# ================ ADMIN DASHBOARD ================

class AdminDashboardResponse(BaseModel):
    """Admin dashboard response schema"""
    users_stats: Dict[str, int]
    transaction_stats: Dict[str, Any]
    asset_stats: Dict[str, int]
    recent_transactions: List[Dict[str, Any]]
    top_assets: List[Dict[str, Any]]


class AdminStatsResponse(BaseModel):
    """Admin statistics response schema"""
    total_users: int
    active_users: int
    new_users_today: int
    new_users_this_week: int
    new_users_this_month: int
    
    total_transactions: int
    pending_withdrawals: int
    total_volume: Decimal
    volume_today: Decimal
    
    total_assets: int
    active_assets: int
    trending_assets: int


# ================ ADMIN USER MANAGEMENT ================

class AdminUserResponse(BaseModel):
    """Admin user response schema"""
    id: str
    telegram_id: int
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    
    role: UserRole
    status: UserStatus
    verification_level: VerificationLevel
    risk_level: RiskLevel
    
    country: Optional[str]
    language_code: Optional[str]
    is_premium: bool
    
    trading_enabled: bool
    notifications_enabled: bool
    two_factor_enabled: bool
    
    # Statistics
    total_deposits: Decimal
    total_withdrawals: Decimal
    total_volume: Decimal
    trades_count: int
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_active: Optional[datetime]
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True


class AdminUserUpdate(BaseModel):
    """Admin user update schema"""
    status: Optional[UserStatus] = None
    verification_level: Optional[VerificationLevel] = None
    risk_level: Optional[RiskLevel] = None
    trading_enabled: Optional[bool] = None
    daily_withdrawal_limit: Optional[Decimal] = None
    max_trade_amount: Optional[Decimal] = None


class UserActionRequest(BaseModel):
    """User action request schema"""
    reason: Optional[str] = None
    notify_user: bool = True


# ================ ADMIN TRANSACTION MANAGEMENT ================

class AdminTransactionResponse(BaseModel):
    """Admin transaction response schema"""
    id: str
    user_id: str
    asset_id: Optional[str]
    
    type: TransactionType
    status: TransactionStatus
    
    amount: Decimal
    price: Optional[Decimal]
    fee: Decimal
    total_amount: Decimal
    
    # External transaction data
    external_id: Optional[str]
    hash: Optional[str]
    network: Optional[str]
    from_address: Optional[str]
    to_address: Optional[str]
    
    description: Optional[str]
    
    # Admin fields
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    rejection_reason: Optional[str]
    admin_notes: Optional[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    
    # User info (populated by join)
    user_username: Optional[str] = None
    user_first_name: Optional[str] = None
    user_last_name: Optional[str] = None
    
    # Asset info (populated by join)
    asset_symbol: Optional[str] = None
    asset_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class WithdrawalApprovalRequest(BaseModel):
    """Withdrawal approval request schema"""
    notes: Optional[str] = None


class TransactionActionRequest(BaseModel):
    """Transaction action request schema"""
    reason: str = Field(..., min_length=5, max_length=500)
    notify_user: bool = True


# ================ ADMIN ASSET MANAGEMENT ================

class AdminAssetResponse(BaseModel):
    """Admin asset response schema"""
    id: str
    symbol: str
    name: str
    description: Optional[str]
    asset_type: AssetType
    category: Optional[str]
    icon_url: Optional[str]
    
    # Trading settings
    is_active: bool
    is_tradeable: bool
    is_visible: bool
    is_trending: bool
    
    # Price data
    current_price: Decimal
    price_24h_change: Decimal
    price_24h_change_percent: Decimal
    volume_24h: Decimal
    market_cap: Optional[Decimal]
    
    # Trading limits
    min_trade_amount: Decimal
    max_trade_amount: Decimal
    precision: int
    
    # Integration
    alpha_vantage_symbol: Optional[str]
    alpha_vantage_function: Optional[str]
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_price_update: Optional[datetime]
    
    class Config:
        from_attributes = True


class AdminAssetUpdate(BaseModel):
    """Admin asset update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_tradeable: Optional[bool] = None
    is_visible: Optional[bool] = None
    is_trending: Optional[bool] = None
    min_trade_amount: Optional[Decimal] = None
    max_trade_amount: Optional[Decimal] = None
    alpha_vantage_symbol: Optional[str] = None
    alpha_vantage_function: Optional[str] = None


class AdminAssetCreate(BaseModel):
    """Admin asset creation schema"""
    symbol: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    asset_type: AssetType
    category: Optional[str] = None
    current_price: Decimal = Field(default=Decimal("0"))
    min_trade_amount: Decimal = Field(default=Decimal("0.01"))
    max_trade_amount: Decimal = Field(default=Decimal("1000000"))
    precision: int = Field(default=8, ge=0, le=18)
    alpha_vantage_symbol: Optional[str] = None
    alpha_vantage_function: Optional[str] = None


# ================ PLATFORM SETTINGS ================

class PlatformSettingsResponse(BaseModel):
    """Platform settings response schema"""
    id: str
    key: str
    value: str
    description: Optional[str]
    category: str
    data_type: str
    is_public: bool
    is_editable: bool
    min_value: Optional[float]
    max_value: Optional[float]
    allowed_values: Optional[str]
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[str]
    
    class Config:
        from_attributes = True


class PlatformSettingsUpdate(BaseModel):
    """Platform settings update schema"""
    key: str
    value: str


class PlatformSettingsCreate(BaseModel):
    """Platform settings creation schema"""
    key: str = Field(..., min_length=1, max_length=100)
    value: str
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=50)
    data_type: str = Field(default="string")
    is_public: bool = Field(default=False)
    is_editable: bool = Field(default=True)
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    allowed_values: Optional[str] = None


# ================ AUDIT LOGS ================

class AuditLogResponse(BaseModel):
    """Audit log response schema"""
    id: str
    user_id: Optional[str]
    user_role: Optional[str]
    ip_address: str
    user_agent: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    old_values: Optional[Dict[str, Any]]
    new_values: Optional[Dict[str, Any]]
    description: Optional[str]
    metadata: Optional[Dict[str, Any]]
    success: bool
    error_message: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ================ NOTIFICATIONS MANAGEMENT ================

class AdminNotificationCreate(BaseModel):
    """Admin notification creation schema"""
    user_id: Optional[str] = None  # If None, send to all users
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    type: str = Field(default="admin_message")
    priority: str = Field(default="normal")
    is_actionable: bool = Field(default=False)
    action_url: Optional[str] = None


class AdminNotificationResponse(BaseModel):
    """Admin notification response schema"""
    id: str
    user_id: str
    title: str
    message: str
    type: str
    status: str
    priority: str
    is_actionable: bool
    action_url: Optional[str]
    created_at: datetime
    sent_at: Optional[datetime]
    read_at: Optional[datetime]
    
    # User info
    user_username: Optional[str] = None
    user_first_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# ================ SYSTEM METRICS ================

class SystemMetricsResponse(BaseModel):
    """System metrics response schema"""
    timestamp: datetime
    metric_name: str
    metric_value: float
    metric_unit: Optional[str]
    category: str
    subcategory: Optional[str]
    
    class Config:
        from_attributes = True


class SystemHealthResponse(BaseModel):
    """System health response schema"""
    status: str
    uptime: int
    database_status: str
    redis_status: str
    telegram_bot_status: str
    celery_status: str
    last_price_update: Optional[datetime]
    active_users_count: int
    pending_transactions_count: int


# ================ TELEGRAM INTEGRATION ================

class TelegramMessageRequest(BaseModel):
    """Telegram message request schema"""
    user_id: Optional[str] = None  # If None, send to all users
    message: str = Field(..., min_length=1, max_length=4000)
    parse_mode: str = Field(default="Markdown")


class TelegramBroadcastRequest(BaseModel):
    """Telegram broadcast request schema"""
    message: str = Field(..., min_length=1, max_length=4000)
    target_users: str = Field(default="all")  # all, active, premium, admins
    parse_mode: str = Field(default="Markdown")


# ================ REPORTS ================

class AdminReportRequest(BaseModel):
    """Admin report request schema"""
    report_type: str = Field(..., regex="^(users|transactions|assets|revenue)$")
    start_date: datetime
    end_date: datetime
    format: str = Field(default="json", regex="^(json|csv|pdf)$")
    filters: Optional[Dict[str, Any]] = None


class AdminReportResponse(BaseModel):
    """Admin report response schema"""
    report_id: str
    report_type: str
    status: str
    progress: int
    download_url: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
