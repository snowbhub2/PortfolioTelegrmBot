"""
Pydantic schemas for trading-related API endpoints
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

from app.models.trading import (
    AssetType, TransactionType, TransactionStatus,
    OrderType, OrderSide, OrderStatus
)


# ================ ASSET SCHEMAS ================

class AssetBase(BaseModel):
    """Base asset schema"""
    symbol: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    asset_type: AssetType
    category: Optional[str] = None
    icon_url: Optional[str] = None
    website_url: Optional[str] = None


class AssetCreate(AssetBase):
    """Asset creation schema"""
    current_price: Decimal = Field(default=Decimal("0"), ge=0)
    min_trade_amount: Decimal = Field(default=Decimal("0.01"), gt=0)
    max_trade_amount: Decimal = Field(default=Decimal("1000000"), gt=0)
    precision: int = Field(default=8, ge=0, le=18)
    alpha_vantage_symbol: Optional[str] = None
    alpha_vantage_function: Optional[str] = None


class AssetUpdate(BaseModel):
    """Asset update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    website_url: Optional[str] = None
    is_active: Optional[bool] = None
    is_tradeable: Optional[bool] = None
    is_visible: Optional[bool] = None
    is_trending: Optional[bool] = None
    min_trade_amount: Optional[Decimal] = None
    max_trade_amount: Optional[Decimal] = None
    precision: Optional[int] = None


class AssetResponse(BaseModel):
    """Asset response schema"""
    id: str
    symbol: str
    name: str
    description: Optional[str]
    asset_type: AssetType
    category: Optional[str]
    icon_url: Optional[str]
    website_url: Optional[str]
    
    is_active: bool
    is_tradeable: bool
    is_visible: bool
    is_trending: bool
    
    current_price: Decimal
    price_24h_change: Decimal
    price_24h_change_percent: Decimal
    volume_24h: Decimal
    market_cap: Optional[Decimal]
    
    min_trade_amount: Decimal
    max_trade_amount: Decimal
    precision: int
    
    created_at: datetime
    updated_at: datetime
    last_price_update: Optional[datetime]
    
    class Config:
        from_attributes = True


class AssetListResponse(BaseModel):
    """Asset list response schema"""
    assets: List[AssetResponse]
    total: int
    limit: int
    offset: int


# ================ ORDER SCHEMAS ================

class OrderCreate(BaseModel):
    """Order creation schema"""
    asset_id: str
    type: OrderType
    side: OrderSide
    quantity: Decimal = Field(..., gt=0)
    price: Optional[Decimal] = Field(None, gt=0)  # None for market orders
    stop_price: Optional[Decimal] = Field(None, gt=0)  # For stop orders
    time_in_force: str = Field(default="GTC")  # GTC, IOC, FOK
    client_order_id: Optional[str] = None
    
    @validator('price')
    def validate_price_for_limit_orders(cls, v, values):
        if values.get('type') == OrderType.LIMIT and v is None:
            raise ValueError('Price is required for limit orders')
        return v


class OrderResponse(BaseModel):
    """Order response schema"""
    id: str
    user_id: str
    asset_id: str
    
    type: OrderType
    side: OrderSide
    status: OrderStatus
    
    quantity: Decimal
    filled_quantity: Decimal
    remaining_quantity: Decimal
    
    price: Optional[Decimal]
    stop_price: Optional[Decimal]
    average_fill_price: Optional[Decimal]
    
    total_cost: Decimal
    fee: Decimal
    
    time_in_force: str
    expires_at: Optional[datetime]
    
    client_order_id: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    filled_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    
    # Asset info (populated by join)
    asset_symbol: Optional[str] = None
    asset_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Order list response schema"""
    orders: List[OrderResponse]
    total: int
    limit: int
    offset: int


# ================ TRANSACTION SCHEMAS ================

class TransactionCreate(BaseModel):
    """Transaction creation schema"""
    asset_id: Optional[str] = None
    amount: Decimal = Field(..., gt=0)
    network: Optional[str] = None
    to_address: Optional[str] = None  # For withdrawals
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class TransactionResponse(BaseModel):
    """Transaction response schema"""
    id: str
    user_id: str
    asset_id: Optional[str]
    
    type: TransactionType
    status: TransactionStatus
    
    amount: Decimal
    price: Optional[Decimal]
    fee: Decimal
    total_amount: Decimal
    
    external_id: Optional[str]
    hash: Optional[str]
    block_number: Optional[int]
    confirmations: int
    
    network: Optional[str]
    from_address: Optional[str]
    to_address: Optional[str]
    
    description: Optional[str]
    metadata: Optional[Dict[str, Any]]
    
    approved_by: Optional[str]
    approved_at: Optional[datetime]
    rejection_reason: Optional[str]
    admin_notes: Optional[str]
    
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    
    # Asset info (populated by join)
    asset_symbol: Optional[str] = None
    asset_name: Optional[str] = None
    
    class Config:
        from_attributes = True


# ================ PRICE HISTORY SCHEMAS ================

class PriceHistoryResponse(BaseModel):
    """Price history response schema"""
    timestamp: datetime
    interval: str
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    vwap: Optional[Decimal]
    trades_count: Optional[int]
    
    class Config:
        from_attributes = True


# ================ PORTFOLIO SCHEMAS ================

class PortfolioItemResponse(BaseModel):
    """Portfolio item response schema"""
    asset_id: str
    asset_symbol: str
    asset_name: str
    asset_type: AssetType
    
    quantity: Decimal
    available_quantity: Decimal
    locked_quantity: Decimal
    
    average_cost: Decimal
    current_price: Decimal
    market_value: Decimal
    
    unrealized_pnl: Decimal
    unrealized_pnl_percent: Decimal
    realized_pnl: Decimal
    
    allocation_percent: Decimal


class PortfolioStatsResponse(BaseModel):
    """Portfolio statistics response schema"""
    total_value: Decimal
    total_cost: Decimal
    total_pnl: Decimal
    total_pnl_percent: Decimal
    
    daily_change: Decimal
    daily_change_percent: Decimal
    
    asset_count: int
    best_performer: Optional[str]
    worst_performer: Optional[str]


# ================ MARKET DATA SCHEMAS ================

class MarketStatsResponse(BaseModel):
    """Market statistics response schema"""
    total_assets: int
    active_assets: int
    total_market_cap: Decimal
    total_volume_24h: Decimal
    
    top_gainer: Optional[Dict[str, Any]]
    top_loser: Optional[Dict[str, Any]]
    most_traded: Optional[Dict[str, Any]]
    
    price_change_stats: Dict[str, int]  # positive, negative, neutral counts


# ================ TRADING PAIR SCHEMAS ================

class TradingPairResponse(BaseModel):
    """Trading pair response schema"""
    id: str
    symbol: str
    base_asset_id: str
    quote_asset_id: str
    
    is_active: bool
    min_notional: Decimal
    min_quantity: Decimal
    max_quantity: Decimal
    
    price_precision: int
    quantity_precision: int
    
    maker_fee: Decimal
    taker_fee: Decimal
    
    # Market data
    last_price: Optional[Decimal] = None
    price_change_24h: Optional[Decimal] = None
    volume_24h: Optional[Decimal] = None
    high_24h: Optional[Decimal] = None
    low_24h: Optional[Decimal] = None
    
    class Config:
        from_attributes = True


# ================ ORDER BOOK SCHEMAS ================

class OrderBookEntry(BaseModel):
    """Order book entry schema"""
    price: Decimal
    quantity: Decimal
    total: Decimal


class OrderBookResponse(BaseModel):
    """Order book response schema"""
    symbol: str
    bids: List[OrderBookEntry]
    asks: List[OrderBookEntry]
    timestamp: datetime


# ================ TRADE SCHEMAS ================

class TradeResponse(BaseModel):
    """Trade response schema"""
    id: str
    symbol: str
    price: Decimal
    quantity: Decimal
    side: OrderSide
    timestamp: datetime
    
    # Optional maker/taker info
    buyer_order_id: Optional[str] = None
    seller_order_id: Optional[str] = None
