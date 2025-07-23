"""
Trading models for assets, portfolios, orders, and transactions
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from enum import Enum
import uuid


class AssetType(str, Enum):
    """Asset types"""
    CRYPTO = "crypto"
    STOCK = "stock"
    COMMODITY = "commodity"
    CURRENCY = "currency"
    INDEX = "index"


class TransactionType(str, Enum):
    """Transaction types"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    BUY = "buy"
    SELL = "sell"
    TRANSFER = "transfer"
    FEE = "fee"
    BONUS = "bonus"
    DIVIDEND = "dividend"


class TransactionStatus(str, Enum):
    """Transaction status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class OrderType(str, Enum):
    """Order types"""
    MARKET = "market"
    LIMIT = "limit"
    STOP_LOSS = "stop_loss"
    TAKE_PROFIT = "take_profit"


class OrderSide(str, Enum):
    """Order side"""
    BUY = "buy"
    SELL = "sell"


class OrderStatus(str, Enum):
    """Order status"""
    PENDING = "pending"
    OPEN = "open"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    EXPIRED = "expired"


class Asset(SQLModel, table=True):
    """Asset model"""
    __tablename__ = "assets"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    symbol: str = Field(unique=True, index=True)
    name: str
    description: Optional[str] = Field(default=None)
    
    # Asset details
    asset_type: AssetType
    category: Optional[str] = Field(default=None)
    icon_url: Optional[str] = Field(default=None)
    website_url: Optional[str] = Field(default=None)
    
    # Trading settings
    is_active: bool = Field(default=True)
    is_tradeable: bool = Field(default=True)
    is_visible: bool = Field(default=True)
    is_trending: bool = Field(default=False)
    
    # Price and market data
    current_price: Decimal = Field(default=Decimal("0"))
    price_24h_change: Decimal = Field(default=Decimal("0"))
    price_24h_change_percent: Decimal = Field(default=Decimal("0"))
    volume_24h: Decimal = Field(default=Decimal("0"))
    market_cap: Optional[Decimal] = Field(default=None)
    
    # Trading limits
    min_trade_amount: Decimal = Field(default=Decimal("0.01"))
    max_trade_amount: Decimal = Field(default=Decimal("1000000"))
    precision: int = Field(default=8)  # Decimal places
    
    # Alpha Vantage integration
    alpha_vantage_symbol: Optional[str] = Field(default=None)
    alpha_vantage_function: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_price_update: Optional[datetime] = Field(default=None)
    
    # Relationships
    portfolios: List["Portfolio"] = Relationship(back_populates="asset")
    transactions: List["Transaction"] = Relationship(back_populates="asset")
    orders: List["Order"] = Relationship(back_populates="asset")
    price_history: List["PriceHistory"] = Relationship(back_populates="asset")


class Portfolio(SQLModel, table=True):
    """User portfolio holdings"""
    __tablename__ = "portfolios"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    asset_id: str = Field(foreign_key="assets.id", index=True)
    
    # Holdings
    quantity: Decimal = Field(default=Decimal("0"))
    available_quantity: Decimal = Field(default=Decimal("0"))  # Not locked in orders
    locked_quantity: Decimal = Field(default=Decimal("0"))  # Locked in open orders
    
    # Cost basis
    average_cost: Decimal = Field(default=Decimal("0"))
    total_cost: Decimal = Field(default=Decimal("0"))
    
    # Performance
    unrealized_pnl: Decimal = Field(default=Decimal("0"))
    realized_pnl: Decimal = Field(default=Decimal("0"))
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: "User" = Relationship(back_populates="portfolios")
    asset: Asset = Relationship(back_populates="portfolios")


class Transaction(SQLModel, table=True):
    """Transaction model"""
    __tablename__ = "transactions"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    asset_id: Optional[str] = Field(foreign_key="assets.id", default=None, index=True)
    
    # Transaction details
    type: TransactionType = Field(index=True)
    status: TransactionStatus = Field(default=TransactionStatus.PENDING, index=True)
    
    # Amounts
    amount: Decimal
    price: Optional[Decimal] = Field(default=None)
    fee: Decimal = Field(default=Decimal("0"))
    total_amount: Decimal  # amount + fee for withdrawals, amount - fee for deposits
    
    # External transaction data
    external_id: Optional[str] = Field(default=None, index=True)
    hash: Optional[str] = Field(default=None, index=True)
    block_number: Optional[int] = Field(default=None)
    confirmations: int = Field(default=0)
    
    # Network and address info
    network: Optional[str] = Field(default=None)
    from_address: Optional[str] = Field(default=None)
    to_address: Optional[str] = Field(default=None)
    
    # Additional data
    description: Optional[str] = Field(default=None)
    metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Admin actions
    approved_by: Optional[str] = Field(default=None)  # admin user id
    approved_at: Optional[datetime] = Field(default=None)
    rejection_reason: Optional[str] = Field(default=None)
    admin_notes: Optional[str] = Field(default=None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    user: "User" = Relationship(back_populates="transactions")
    asset: Optional[Asset] = Relationship(back_populates="transactions")


class Order(SQLModel, table=True):
    """Trading order model"""
    __tablename__ = "orders"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    asset_id: str = Field(foreign_key="assets.id", index=True)
    
    # Order details
    type: OrderType
    side: OrderSide
    status: OrderStatus = Field(default=OrderStatus.PENDING, index=True)
    
    # Quantities and prices
    quantity: Decimal
    filled_quantity: Decimal = Field(default=Decimal("0"))
    remaining_quantity: Decimal
    
    price: Optional[Decimal] = Field(default=None)  # None for market orders
    stop_price: Optional[Decimal] = Field(default=None)  # For stop orders
    
    # Execution details
    average_fill_price: Optional[Decimal] = Field(default=None)
    total_cost: Decimal = Field(default=Decimal("0"))
    fee: Decimal = Field(default=Decimal("0"))
    
    # Order settings
    time_in_force: str = Field(default="GTC")  # GTC, IOC, FOK
    expires_at: Optional[datetime] = Field(default=None)
    
    # Additional data
    client_order_id: Optional[str] = Field(default=None)
    metadata: Optional[Dict[str, Any]] = Field(default=None, sa_column_kwargs={"type_": "JSON"})
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    filled_at: Optional[datetime] = Field(default=None)
    cancelled_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    user: "User" = Relationship(back_populates="orders")
    asset: Asset = Relationship(back_populates="orders")
    fills: List["OrderFill"] = Relationship(back_populates="order")


class OrderFill(SQLModel, table=True):
    """Order fill/execution record"""
    __tablename__ = "order_fills"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    order_id: str = Field(foreign_key="orders.id", index=True)
    
    quantity: Decimal
    price: Decimal
    fee: Decimal
    
    # Trade details
    trade_id: Optional[str] = Field(default=None)
    liquidity: Optional[str] = Field(default=None)  # maker/taker
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    order: Order = Relationship(back_populates="fills")


class PriceHistory(SQLModel, table=True):
    """Historical price data for assets"""
    __tablename__ = "price_history"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    asset_id: str = Field(foreign_key="assets.id", index=True)
    
    # OHLCV data
    timestamp: datetime = Field(index=True)
    interval: str = Field(index=True)  # 1m, 5m, 15m, 1h, 4h, 1d, 1w, 1M
    
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal
    
    # Additional data
    vwap: Optional[Decimal] = Field(default=None)  # Volume weighted average price
    trades_count: Optional[int] = Field(default=None)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    asset: Asset = Relationship(back_populates="price_history")


class TradingPair(SQLModel, table=True):
    """Trading pairs for the platform"""
    __tablename__ = "trading_pairs"
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    
    base_asset_id: str = Field(foreign_key="assets.id")
    quote_asset_id: str = Field(foreign_key="assets.id")
    
    symbol: str = Field(unique=True, index=True)  # e.g., "BTCUSDT"
    
    # Trading settings
    is_active: bool = Field(default=True)
    min_notional: Decimal = Field(default=Decimal("10"))
    min_quantity: Decimal = Field(default=Decimal("0.001"))
    max_quantity: Decimal = Field(default=Decimal("1000000"))
    
    # Precision
    price_precision: int = Field(default=2)
    quantity_precision: int = Field(default=8)
    
    # Fees
    maker_fee: Decimal = Field(default=Decimal("0.001"))
    taker_fee: Decimal = Field(default=Decimal("0.001"))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
