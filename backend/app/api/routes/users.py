"""
User management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_
from typing import List, Optional
from datetime import datetime

from app.core.security import get_current_user, get_current_admin_user
from app.db.database import get_async_db
from app.models import User, Portfolio, Transaction
from app.models.user import UserStatus, VerificationLevel
from app.schemas.users import (
    UserResponse, UserUpdate, UserCreate, UserListResponse,
    PortfolioResponse, TransactionHistoryResponse
)

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update current user information"""
    
    # Update allowed fields
    for field, value in user_update.dict(exclude_unset=True).items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.get("/me/portfolio", response_model=List[PortfolioResponse])
async def get_user_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's portfolio"""
    
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.user_id == current_user.id)
        .where(Portfolio.quantity > 0)
    )
    portfolios = result.scalars().all()
    
    return portfolios


@router.get("/me/transactions", response_model=List[TransactionHistoryResponse])
async def get_user_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    transaction_type: Optional[str] = None
):
    """Get user's transaction history"""
    
    query = select(Transaction).where(Transaction.user_id == current_user.id)
    
    if transaction_type:
        query = query.where(Transaction.type == transaction_type)
    
    query = query.order_by(Transaction.created_at.desc()).offset(offset).limit(limit)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return transactions


@router.post("/me/verify", response_model=UserResponse)
async def start_verification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Start user verification process"""
    
    if current_user.verification_level != VerificationLevel.NONE:
        raise HTTPException(
            status_code=400,
            detail="User is already verified or verification is in progress"
        )
    
    current_user.verification_level = VerificationLevel.BASIC
    current_user.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.get("/", response_model=UserListResponse)
async def get_users(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    status: Optional[UserStatus] = None
):
    """Get all users (Admin only)"""
    
    query = select(User)
    
    if search:
        query = query.where(
            (User.username.ilike(f"%{search}%")) |
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
    
    if status:
        query = query.where(User.status == status)
    
    # Get total count
    total_result = await db.execute(select(User).count())
    total = total_result.scalar()
    
    # Get paginated results
    query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return UserListResponse(
        users=users,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get specific user (Admin only)"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update user (Admin only)"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    for field, value in user_update.dict(exclude_unset=True).items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(user)
    
    return user


@router.post("/{user_id}/ban")
async def ban_user(
    user_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Ban user (Admin only)"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = UserStatus.BANNED
    user.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": f"User {user.username} has been banned"}


@router.post("/{user_id}/unban")
async def unban_user(
    user_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Unban user (Admin only)"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = UserStatus.ACTIVE
    user.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": f"User {user.username} has been unbanned"}


@router.get("/{user_id}/portfolio", response_model=List[PortfolioResponse])
async def get_user_portfolio_admin(
    user_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get user's portfolio (Admin only)"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = await db.execute(
        select(Portfolio).where(Portfolio.user_id == user_id)
    )
    portfolios = result.scalars().all()
    
    return portfolios


@router.get("/{user_id}/transactions", response_model=List[TransactionHistoryResponse])
async def get_user_transactions_admin(
    user_id: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0)
):
    """Get user's transactions (Admin only)"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    query = (
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return transactions


@router.post("/{user_id}/send-message")
async def send_message_to_user(
    user_id: str,
    message: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Send Telegram message to user (Admin only)"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        from app.services.telegram_bot import telegram_bot_service
        
        success = await telegram_bot_service.send_message_to_user(
            user.telegram_id,
            message
        )
        
        if success:
            return {"message": "Message sent successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to send message")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")
