"""
Trading API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from decimal import Decimal

from app.core.security import get_current_user, get_current_admin_user
from app.db.database import get_async_db
from app.models import User, Asset, Portfolio, Transaction, Order, PriceHistory
from app.models.trading import (
    AssetType, TransactionType, TransactionStatus, 
    OrderType, OrderSide, OrderStatus
)
from app.schemas.trading import (
    AssetResponse, AssetListResponse, AssetCreate, AssetUpdate,
    OrderResponse, OrderCreate, OrderListResponse,
    TransactionResponse, TransactionCreate,
    PriceHistoryResponse, MarketStatsResponse
)
from app.services.trading import trading_service

router = APIRouter()


# ================ ASSETS ================

@router.get("/assets", response_model=List[AssetResponse])
async def get_assets(
    db: AsyncSession = Depends(get_async_db),
    asset_type: Optional[AssetType] = None,
    is_active: Optional[bool] = None,
    is_trending: Optional[bool] = None,
    search: Optional[str] = None
):
    """Get all assets"""
    
    query = select(Asset)
    
    if asset_type:
        query = query.where(Asset.asset_type == asset_type)
    
    if is_active is not None:
        query = query.where(Asset.is_active == is_active)
    
    if is_trending is not None:
        query = query.where(Asset.is_trending == is_trending)
    
    if search:
        query = query.where(
            or_(
                Asset.symbol.ilike(f"%{search}%"),
                Asset.name.ilike(f"%{search}%")
            )
        )
    
    query = query.order_by(Asset.symbol)
    
    result = await db.execute(query)
    assets = result.scalars().all()
    
    return assets


@router.get("/assets/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_async_db)
):
    """Get specific asset"""
    
    asset = await db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return asset


@router.get("/assets/{asset_id}/price-history", response_model=List[PriceHistoryResponse])
async def get_asset_price_history(
    asset_id: str,
    db: AsyncSession = Depends(get_async_db),
    interval: str = Query("1d", regex="^(1m|5m|15m|1h|4h|1d|1w|1M)$"),
    days: int = Query(30, ge=1, le=365)
):
    """Get asset price history"""
    
    asset = await db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = (
        select(PriceHistory)
        .where(
            and_(
                PriceHistory.asset_id == asset_id,
                PriceHistory.interval == interval,
                PriceHistory.timestamp >= start_date
            )
        )
        .order_by(PriceHistory.timestamp)
    )
    
    result = await db.execute(query)
    price_history = result.scalars().all()
    
    return price_history


# ================ ORDERS ================

@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_create: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create new trading order"""
    
    # Check if trading is enabled
    if not current_user.trading_enabled:
        raise HTTPException(
            status_code=403,
            detail="Trading is disabled for your account"
        )
    
    # Validate asset
    asset = await db.get(Asset, order_create.asset_id)
    if not asset or not asset.is_active or not asset.is_tradeable:
        raise HTTPException(status_code=400, detail="Asset is not tradeable")
    
    # Create order through trading service
    try:
        order = await trading_service.create_order(
            user_id=current_user.id,
            order_data=order_create,
            db=db
        )
        return order
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating order: {str(e)}")


@router.get("/orders", response_model=List[OrderResponse])
async def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    status: Optional[OrderStatus] = None,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's orders"""
    
    query = select(Order).where(Order.user_id == current_user.id)
    
    if status:
        query = query.where(Order.status == status)
    
    query = query.order_by(Order.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get specific order"""
    
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check ownership
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    
    return order


@router.delete("/orders/{order_id}")
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Cancel order"""
    
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check ownership
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")
    
    # Check if cancellable
    if order.status not in [OrderStatus.PENDING, OrderStatus.OPEN]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled")
    
    try:
        success = await trading_service.cancel_order(order_id, db)
        if success:
            return {"message": "Order cancelled successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to cancel order")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cancelling order: {str(e)}")


# ================ TRANSACTIONS ================

@router.post("/deposit", response_model=TransactionResponse)
async def create_deposit(
    transaction_create: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create deposit transaction"""
    
    try:
        transaction = await trading_service.create_deposit(
            user_id=current_user.id,
            transaction_data=transaction_create,
            db=db
        )
        return transaction
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating deposit: {str(e)}")


@router.post("/withdraw", response_model=TransactionResponse)
async def create_withdrawal(
    transaction_create: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Create withdrawal transaction"""
    
    try:
        transaction = await trading_service.create_withdrawal(
            user_id=current_user.id,
            transaction_data=transaction_create,
            db=db
        )
        return transaction
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating withdrawal: {str(e)}")


@router.get("/transactions", response_model=List[TransactionResponse])
async def get_user_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    transaction_type: Optional[TransactionType] = None,
    status: Optional[TransactionStatus] = None,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's transactions"""
    
    query = select(Transaction).where(Transaction.user_id == current_user.id)
    
    if transaction_type:
        query = query.where(Transaction.type == transaction_type)
    
    if status:
        query = query.where(Transaction.status == status)
    
    query = query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return transactions


@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get specific transaction"""
    
    transaction = await db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Check ownership
    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this transaction")
    
    return transaction


# ================ PORTFOLIO ================

@router.get("/portfolio", response_model=List[dict])
async def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's portfolio with current values"""
    
    return await trading_service.get_user_portfolio(current_user.id, db)


@router.get("/portfolio/stats")
async def get_portfolio_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get portfolio statistics"""
    
    return await trading_service.get_portfolio_stats(current_user.id, db)


# ================ MARKET DATA ================

@router.get("/market/stats", response_model=MarketStatsResponse)
async def get_market_stats(
    db: AsyncSession = Depends(get_async_db)
):
    """Get market statistics"""
    
    return await trading_service.get_market_stats(db)


@router.get("/market/trending", response_model=List[AssetResponse])
async def get_trending_assets(
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(10, le=50)
):
    """Get trending assets"""
    
    query = (
        select(Asset)
        .where(and_(Asset.is_trending == True, Asset.is_active == True))
        .order_by(Asset.volume_24h.desc())
        .limit(limit)
    )
    
    result = await db.execute(query)
    assets = result.scalars().all()
    
    return assets


@router.get("/market/top-gainers", response_model=List[AssetResponse])
async def get_top_gainers(
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(10, le=50)
):
    """Get top gaining assets"""
    
    query = (
        select(Asset)
        .where(and_(Asset.is_active == True, Asset.price_24h_change_percent > 0))
        .order_by(Asset.price_24h_change_percent.desc())
        .limit(limit)
    )
    
    result = await db.execute(query)
    assets = result.scalars().all()
    
    return assets


@router.get("/market/top-losers", response_model=List[AssetResponse])
async def get_top_losers(
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(10, le=50)
):
    """Get top losing assets"""
    
    query = (
        select(Asset)
        .where(and_(Asset.is_active == True, Asset.price_24h_change_percent < 0))
        .order_by(Asset.price_24h_change_percent.asc())
        .limit(limit)
    )
    
    result = await db.execute(query)
    assets = result.scalars().all()
    
    return assets
