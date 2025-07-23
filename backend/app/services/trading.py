"""
Trading service for order processing and portfolio management
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, func

from app.models import User, Asset, Portfolio, Order, Transaction, OrderFill
from app.models.trading import (
    OrderType, OrderSide, OrderStatus, TransactionType, TransactionStatus
)
from app.schemas.trading import OrderCreate, TransactionCreate
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class TradingService:
    """Service for handling trading operations"""
    
    async def create_order(
        self, 
        user_id: str, 
        order_data: OrderCreate, 
        db: AsyncSession
    ) -> Order:
        """Create a new trading order"""
        
        # Get asset
        asset = await db.get(Asset, order_data.asset_id)
        if not asset:
            raise ValueError("Asset not found")
        
        # Validate order
        await self._validate_order(user_id, order_data, asset, db)
        
        # Calculate order price and quantity
        if order_data.type == OrderType.MARKET:
            # Use current market price for market orders
            price = asset.current_price
        else:
            price = order_data.price
        
        # Create order
        order = Order(
            user_id=user_id,
            asset_id=order_data.asset_id,
            type=order_data.type,
            side=order_data.side,
            quantity=order_data.quantity,
            remaining_quantity=order_data.quantity,
            price=price,
            stop_price=order_data.stop_price,
            time_in_force=order_data.time_in_force,
            client_order_id=order_data.client_order_id,
            status=OrderStatus.PENDING
        )
        
        db.add(order)
        await db.commit()
        await db.refresh(order)
        
        # Process order based on type
        if order_data.type == OrderType.MARKET:
            # Execute market order immediately
            await self._execute_market_order(order, db)
        else:
            # Add limit order to order book
            await self._add_to_order_book(order, db)
        
        return order
    
    async def _validate_order(
        self, 
        user_id: str, 
        order_data: OrderCreate, 
        asset: Asset, 
        db: AsyncSession
    ):
        """Validate order parameters"""
        
        # Check asset trading limits
        if order_data.quantity < asset.min_trade_amount:
            raise ValueError(f"Quantity below minimum: {asset.min_trade_amount}")
        
        if order_data.quantity > asset.max_trade_amount:
            raise ValueError(f"Quantity above maximum: {asset.max_trade_amount}")
        
        # For buy orders, check if user has enough balance
        if order_data.side == OrderSide.BUY:
            required_amount = order_data.quantity * (order_data.price or asset.current_price)
            await self._check_buying_power(user_id, required_amount, db)
        
        # For sell orders, check if user has enough assets
        if order_data.side == OrderSide.SELL:
            await self._check_asset_balance(user_id, order_data.asset_id, order_data.quantity, db)
    
    async def _check_buying_power(
        self, 
        user_id: str, 
        required_amount: Decimal, 
        db: AsyncSession
    ):
        """Check if user has enough buying power"""
        
        # Get user's USDT balance (assuming USDT as base currency)
        result = await db.execute(
            select(Portfolio).where(
                and_(
                    Portfolio.user_id == user_id,
                    Portfolio.asset_id == "usdt"  # Assuming USDT asset exists
                )
            )
        )
        usdt_portfolio = result.scalar_one_or_none()
        
        if not usdt_portfolio or usdt_portfolio.available_quantity < required_amount:
            raise ValueError("Insufficient buying power")
    
    async def _check_asset_balance(
        self, 
        user_id: str, 
        asset_id: str, 
        required_quantity: Decimal, 
        db: AsyncSession
    ):
        """Check if user has enough asset balance"""
        
        result = await db.execute(
            select(Portfolio).where(
                and_(
                    Portfolio.user_id == user_id,
                    Portfolio.asset_id == asset_id
                )
            )
        )
        portfolio = result.scalar_one_or_none()
        
        if not portfolio or portfolio.available_quantity < required_quantity:
            raise ValueError("Insufficient asset balance")
    
    async def _execute_market_order(self, order: Order, db: AsyncSession):
        """Execute market order immediately"""
        
        try:
            # For demo purposes, execute at current market price
            asset = await db.get(Asset, order.asset_id)
            execution_price = asset.current_price
            
            # Calculate fee
            fee_rate = Decimal(str(settings.DEFAULT_TRADING_FEE))
            fee = order.quantity * execution_price * fee_rate
            
            # Create order fill
            fill = OrderFill(
                order_id=order.id,
                quantity=order.quantity,
                price=execution_price,
                fee=fee
            )
            
            # Update order
            order.status = OrderStatus.FILLED
            order.filled_quantity = order.quantity
            order.remaining_quantity = Decimal("0")
            order.average_fill_price = execution_price
            order.total_cost = order.quantity * execution_price
            order.fee = fee
            order.filled_at = datetime.utcnow()
            
            # Update portfolio
            await self._update_portfolio_from_fill(order, fill, db)
            
            # Create transaction record
            await self._create_transaction_from_order(order, fill, db)
            
            db.add(fill)
            await db.commit()
            
            logger.info(f"Market order {order.id} executed at {execution_price}")
            
        except Exception as e:
            order.status = OrderStatus.REJECTED
            await db.commit()
            logger.error(f"Failed to execute market order {order.id}: {e}")
            raise
    
    async def _add_to_order_book(self, order: Order, db: AsyncSession):
        """Add limit order to order book"""
        
        # For demo purposes, just set status to OPEN
        # In a real system, this would interact with the matching engine
        order.status = OrderStatus.OPEN
        await db.commit()
        
        logger.info(f"Limit order {order.id} added to order book")
    
    async def _update_portfolio_from_fill(self, order: Order, fill: OrderFill, db: AsyncSession):
        """Update user portfolio based on order fill"""
        
        if order.side == OrderSide.BUY:
            # Add asset to portfolio
            await self._add_to_portfolio(
                order.user_id, 
                order.asset_id, 
                fill.quantity, 
                fill.price,
                db
            )
            
            # Deduct USDT from portfolio
            cost = fill.quantity * fill.price + fill.fee
            await self._deduct_from_portfolio(
                order.user_id, 
                "usdt",  # Assuming USDT base currency
                cost,
                db
            )
            
        else:  # SELL
            # Deduct asset from portfolio
            await self._deduct_from_portfolio(
                order.user_id, 
                order.asset_id, 
                fill.quantity,
                db
            )
            
            # Add USDT to portfolio
            proceeds = fill.quantity * fill.price - fill.fee
            await self._add_to_portfolio(
                order.user_id, 
                "usdt",
                proceeds, 
                Decimal("1"),  # USDT price is 1
                db
            )
    
    async def _add_to_portfolio(
        self, 
        user_id: str, 
        asset_id: str, 
        quantity: Decimal, 
        price: Decimal,
        db: AsyncSession
    ):
        """Add quantity to user's portfolio"""
        
        result = await db.execute(
            select(Portfolio).where(
                and_(
                    Portfolio.user_id == user_id,
                    Portfolio.asset_id == asset_id
                )
            )
        )
        portfolio = result.scalar_one_or_none()
        
        if portfolio:
            # Update existing portfolio
            old_quantity = portfolio.quantity
            old_cost = portfolio.total_cost
            
            new_quantity = old_quantity + quantity
            new_cost = old_cost + (quantity * price)
            
            portfolio.quantity = new_quantity
            portfolio.available_quantity += quantity
            portfolio.total_cost = new_cost
            portfolio.average_cost = new_cost / new_quantity if new_quantity > 0 else Decimal("0")
            portfolio.updated_at = datetime.utcnow()
            
        else:
            # Create new portfolio entry
            portfolio = Portfolio(
                user_id=user_id,
                asset_id=asset_id,
                quantity=quantity,
                available_quantity=quantity,
                locked_quantity=Decimal("0"),
                average_cost=price,
                total_cost=quantity * price
            )
            db.add(portfolio)
    
    async def _deduct_from_portfolio(
        self, 
        user_id: str, 
        asset_id: str, 
        quantity: Decimal,
        db: AsyncSession
    ):
        """Deduct quantity from user's portfolio"""
        
        result = await db.execute(
            select(Portfolio).where(
                and_(
                    Portfolio.user_id == user_id,
                    Portfolio.asset_id == asset_id
                )
            )
        )
        portfolio = result.scalar_one_or_none()
        
        if not portfolio:
            raise ValueError("Portfolio not found")
        
        if portfolio.available_quantity < quantity:
            raise ValueError("Insufficient balance in portfolio")
        
        portfolio.quantity -= quantity
        portfolio.available_quantity -= quantity
        portfolio.updated_at = datetime.utcnow()
        
        # Remove portfolio entry if quantity is zero
        if portfolio.quantity <= 0:
            await db.delete(portfolio)
    
    async def _create_transaction_from_order(self, order: Order, fill: OrderFill, db: AsyncSession):
        """Create transaction record from order execution"""
        
        transaction_type = TransactionType.BUY if order.side == OrderSide.BUY else TransactionType.SELL
        
        transaction = Transaction(
            user_id=order.user_id,
            asset_id=order.asset_id,
            type=transaction_type,
            status=TransactionStatus.COMPLETED,
            amount=fill.quantity,
            price=fill.price,
            fee=fill.fee,
            total_amount=fill.quantity * fill.price,
            description=f"{order.side.value} order execution",
            completed_at=datetime.utcnow()
        )
        
        db.add(transaction)
    
    async def cancel_order(self, order_id: str, db: AsyncSession) -> bool:
        """Cancel an order"""
        
        order = await db.get(Order, order_id)
        if not order:
            return False
        
        if order.status not in [OrderStatus.PENDING, OrderStatus.OPEN]:
            return False
        
        order.status = OrderStatus.CANCELLED
        order.cancelled_at = datetime.utcnow()
        
        await db.commit()
        
        logger.info(f"Order {order_id} cancelled")
        return True
    
    async def create_deposit(
        self, 
        user_id: str, 
        transaction_data: TransactionCreate, 
        db: AsyncSession
    ) -> Transaction:
        """Create deposit transaction"""
        
        transaction = Transaction(
            user_id=user_id,
            asset_id=transaction_data.asset_id,
            type=TransactionType.DEPOSIT,
            status=TransactionStatus.PENDING,
            amount=transaction_data.amount,
            fee=Decimal("0"),  # No fee for deposits
            total_amount=transaction_data.amount,
            network=transaction_data.network,
            description=transaction_data.description or "Deposit",
            metadata=transaction_data.metadata
        )
        
        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)
        
        return transaction
    
    async def create_withdrawal(
        self, 
        user_id: str, 
        transaction_data: TransactionCreate, 
        db: AsyncSession
    ) -> Transaction:
        """Create withdrawal transaction"""
        
        # Check balance
        if transaction_data.asset_id:
            await self._check_asset_balance(
                user_id, 
                transaction_data.asset_id, 
                transaction_data.amount, 
                db
            )
        
        # Calculate fee
        fee_rate = Decimal(str(settings.DEFAULT_WITHDRAWAL_FEE))
        fee = transaction_data.amount * fee_rate
        total_amount = transaction_data.amount + fee
        
        transaction = Transaction(
            user_id=user_id,
            asset_id=transaction_data.asset_id,
            type=TransactionType.WITHDRAWAL,
            status=TransactionStatus.PENDING,
            amount=transaction_data.amount,
            fee=fee,
            total_amount=total_amount,
            network=transaction_data.network,
            to_address=transaction_data.to_address,
            description=transaction_data.description or "Withdrawal",
            metadata=transaction_data.metadata
        )
        
        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)
        
        return transaction
    
    async def get_user_portfolio(self, user_id: str, db: AsyncSession) -> List[Dict[str, Any]]:
        """Get user's portfolio with current market values"""
        
        query = """
        SELECT 
            p.*,
            a.symbol as asset_symbol,
            a.name as asset_name,
            a.current_price,
            a.asset_type,
            (p.quantity * a.current_price) as market_value,
            ((a.current_price - p.average_cost) / p.average_cost * 100) as pnl_percent
        FROM portfolios p
        JOIN assets a ON p.asset_id = a.id
        WHERE p.user_id = :user_id AND p.quantity > 0
        ORDER BY market_value DESC
        """
        
        result = await db.execute(query, {"user_id": user_id})
        return [dict(row) for row in result.fetchall()]
    
    async def get_portfolio_stats(self, user_id: str, db: AsyncSession) -> Dict[str, Any]:
        """Get portfolio statistics"""
        
        portfolio = await self.get_user_portfolio(user_id, db)
        
        if not portfolio:
            return {
                "total_value": Decimal("0"),
                "total_cost": Decimal("0"),
                "total_pnl": Decimal("0"),
                "total_pnl_percent": Decimal("0"),
                "asset_count": 0
            }
        
        total_value = sum(Decimal(str(item["market_value"])) for item in portfolio)
        total_cost = sum(Decimal(str(item["total_cost"])) for item in portfolio)
        total_pnl = total_value - total_cost
        total_pnl_percent = (total_pnl / total_cost * 100) if total_cost > 0 else Decimal("0")
        
        return {
            "total_value": total_value,
            "total_cost": total_cost,
            "total_pnl": total_pnl,
            "total_pnl_percent": total_pnl_percent,
            "asset_count": len(portfolio)
        }
    
    async def get_market_stats(self, db: AsyncSession) -> Dict[str, Any]:
        """Get market statistics"""
        
        # Total assets
        total_assets_result = await db.execute(select(func.count(Asset.id)))
        total_assets = total_assets_result.scalar()
        
        # Active assets
        active_assets_result = await db.execute(
            select(func.count(Asset.id)).where(Asset.is_active == True)
        )
        active_assets = active_assets_result.scalar()
        
        # Total market cap and volume
        market_cap_result = await db.execute(
            select(func.sum(Asset.market_cap)).where(Asset.is_active == True)
        )
        total_market_cap = market_cap_result.scalar() or Decimal("0")
        
        volume_result = await db.execute(
            select(func.sum(Asset.volume_24h)).where(Asset.is_active == True)
        )
        total_volume_24h = volume_result.scalar() or Decimal("0")
        
        return {
            "total_assets": total_assets,
            "active_assets": active_assets,
            "total_market_cap": total_market_cap,
            "total_volume_24h": total_volume_24h
        }


# Global instance
trading_service = TradingService()
