"""
Pydantic schemas for user-related API endpoints
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

from app.models.user import UserRole, UserStatus, VerificationLevel, RiskLevel
from app.models.trading import TransactionType, TransactionStatus


class UserBase(BaseModel):
    """Base user schema"""
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    telegram_id: int
    language_code: Optional[str] = "en"


class UserUpdate(BaseModel):
    """User update schema"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    notifications_enabled: Optional[bool] = None


class UserResponse(BaseModel):
    """User response schema"""
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
    
    language_code: Optional[str]
    is_premium: bool
    
    country: Optional[str]
    city: Optional[str]
    timezone: Optional[str]
    
    trading_enabled: bool
    notifications_enabled: bool
    two_factor_enabled: bool
    
    total_deposits: Decimal
    total_withdrawals: Decimal
    total_volume: Decimal
    trades_count: int
    
    created_at: datetime
    updated_at: datetime
    last_active: Optional[datetime]
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """User list response schema"""
    users: List[UserResponse]
    total: int
    limit: int
    offset: int


class PortfolioResponse(BaseModel):
    """Portfolio response schema"""
    id: str
    asset_id: str
    quantity: Decimal
    available_quantity: Decimal
    locked_quantity: Decimal
    average_cost: Decimal
    total_cost: Decimal
    unrealized_pnl: Decimal
    realized_pnl: Decimal
    created_at: datetime
    updated_at: datetime
    
    # Asset information (populated by join)
    asset_symbol: Optional[str] = None
    asset_name: Optional[str] = None
    current_price: Optional[Decimal] = None
    
    class Config:
        from_attributes = True


class TransactionHistoryResponse(BaseModel):
    """Transaction history response schema"""
    id: str
    type: TransactionType
    status: TransactionStatus
    amount: Decimal
    price: Optional[Decimal]
    fee: Decimal
    total_amount: Decimal
    
    asset_id: Optional[str]
    asset_symbol: Optional[str] = None
    asset_name: Optional[str] = None
    
    external_id: Optional[str]
    hash: Optional[str]
    network: Optional[str]
    from_address: Optional[str]
    to_address: Optional[str]
    
    description: Optional[str]
    
    created_at: datetime
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    """User statistics response schema"""
    total_users: int
    active_users: int
    verified_users: int
    total_volume: Decimal
    total_deposits: Decimal
    total_withdrawals: Decimal
    new_users_today: int
    new_users_this_week: int
    new_users_this_month: int


class UserActivityResponse(BaseModel):
    """User activity response schema"""
    user_id: str
    username: Optional[str]
    last_active: Optional[datetime]
    last_login: Optional[datetime]
    session_count: int
    transaction_count: int
    total_volume: Decimal
    
    class Config:
        from_attributes = True
