"""
Admin panel API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, and_, or_, func, desc
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal

from app.core.security import get_current_admin_user, get_current_super_admin_user
from app.db.database import get_async_db
from app.models import (
    User, Asset, Transaction, Order, Portfolio, 
    Notification, PlatformSettings, AuditLog
)
from app.models.user import UserStatus, VerificationLevel
from app.models.trading import TransactionStatus, AssetType
from app.schemas.admin import (
    AdminStatsResponse, AdminUserResponse, AdminTransactionResponse,
    AdminAssetResponse, PlatformSettingsResponse, PlatformSettingsUpdate,
    AdminDashboardResponse, WithdrawalApprovalRequest
)
from app.services.telegram_bot import telegram_bot_service

router = APIRouter()


# ================ DASHBOARD ================

@router.get("/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Get admin dashboard data"""
    
    # Users stats
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()
    
    active_users_result = await db.execute(
        select(func.count(User.id)).where(User.status == UserStatus.ACTIVE)
    )
    active_users = active_users_result.scalar()
    
    # New users today
    today = datetime.utcnow().date()
    new_users_today_result = await db.execute(
        select(func.count(User.id)).where(func.date(User.created_at) == today)
    )
    new_users_today = new_users_today_result.scalar()
    
    # Transaction stats
    total_volume_result = await db.execute(
        select(func.sum(Transaction.total_amount)).where(
            Transaction.status == TransactionStatus.COMPLETED
        )
    )
    total_volume = total_volume_result.scalar() or Decimal("0")
    
    # Pending transactions
    pending_withdrawals_result = await db.execute(
        select(func.count(Transaction.id)).where(
            and_(
                Transaction.type == "withdrawal",
                Transaction.status == TransactionStatus.PENDING
            )
        )
    )
    pending_withdrawals = pending_withdrawals_result.scalar()
    
    # Assets stats
    total_assets_result = await db.execute(select(func.count(Asset.id)))
    total_assets = total_assets_result.scalar()
    
    active_assets_result = await db.execute(
        select(func.count(Asset.id)).where(Asset.is_active == True)
    )
    active_assets = active_assets_result.scalar()
    
    # Recent transactions
    recent_transactions_result = await db.execute(
        select(Transaction)
        .order_by(desc(Transaction.created_at))
        .limit(10)
    )
    recent_transactions = recent_transactions_result.scalars().all()
    
    # Top assets by volume
    top_assets_result = await db.execute(
        select(Asset)
        .where(Asset.is_active == True)
        .order_by(desc(Asset.volume_24h))
        .limit(5)
    )
    top_assets = top_assets_result.scalars().all()
    
    return AdminDashboardResponse(
        users_stats={
            "total": total_users,
            "active": active_users,
            "new_today": new_users_today
        },
        transaction_stats={
            "total_volume": total_volume,
            "pending_withdrawals": pending_withdrawals
        },
        asset_stats={
            "total": total_assets,
            "active": active_assets
        },
        recent_transactions=[
            {
                "id": tx.id,
                "type": tx.type,
                "amount": tx.amount,
                "status": tx.status,
                "created_at": tx.created_at
            } for tx in recent_transactions
        ],
        top_assets=[
            {
                "id": asset.id,
                "symbol": asset.symbol,
                "name": asset.name,
                "volume_24h": asset.volume_24h,
                "change_24h": asset.price_24h_change_percent
            } for asset in top_assets
        ]
    )


# ================ USERS MANAGEMENT ================

@router.get("/users", response_model=List[AdminUserResponse])
async def get_admin_users(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    status: Optional[UserStatus] = None,
    verification_level: Optional[VerificationLevel] = None
):
    """Get users list for admin"""
    
    query = select(User)
    
    if search:
        query = query.where(
            or_(
                User.username.ilike(f"%{search}%"),
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    if status:
        query = query.where(User.status == status)
    
    if verification_level:
        query = query.where(User.verification_level == verification_level)
    
    query = query.order_by(desc(User.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return users


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    new_status: UserStatus,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update user status"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_status = user.status
    user.status = new_status
    user.updated_at = datetime.utcnow()
    
    await db.commit()
    
    # Log admin action
    await log_admin_action(
        admin_user.id, 
        "update_user_status",
        "user",
        user_id,
        {"old_status": old_status, "new_status": new_status},
        db
    )
    
    # Send notification to user if banned/unbanned
    if new_status == UserStatus.BANNED:
        await telegram_bot_service.send_message_to_user(
            user.telegram_id,
            "⛔ Ваш аккаунт был заблокирован. Обратитесь в поддержку для получения информации."
        )
    elif old_status == UserStatus.BANNED and new_status == UserStatus.ACTIVE:
        await telegram_bot_service.send_message_to_user(
            user.telegram_id,
            "✅ Ваш аккаунт был разблокирован. Вы можете продолжить использование платформы."
        )
    
    return {"message": f"User status updated to {new_status}"}


@router.post("/users/{user_id}/send-message")
async def send_message_to_user(
    user_id: str,
    message: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Send message to user via Telegram"""
    
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Send message
    success = await telegram_bot_service.send_message_to_user(
        user.telegram_id,
        f"📩 **Сообщение от администрации:**\n\n{message}"
    )
    
    if success:
        # Log admin action
        await log_admin_action(
            admin_user.id,
            "send_message",
            "user", 
            user_id,
            {"message": message},
            db
        )
        
        return {"message": "Message sent successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to send message")


# ================ TRANSACTIONS MANAGEMENT ================

@router.get("/transactions", response_model=List[AdminTransactionResponse])
async def get_admin_transactions(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    transaction_type: Optional[str] = None,
    status: Optional[TransactionStatus] = None,
    user_search: Optional[str] = None
):
    """Get transactions for admin"""
    
    query = select(Transaction)
    
    if transaction_type:
        query = query.where(Transaction.type == transaction_type)
    
    if status:
        query = query.where(Transaction.status == status)
    
    if user_search:
        # Join with users table to search by username
        query = query.join(User).where(
            or_(
                User.username.ilike(f"%{user_search}%"),
                User.first_name.ilike(f"%{user_search}%"),
                User.last_name.ilike(f"%{user_search}%")
            )
        )
    
    query = query.order_by(desc(Transaction.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    transactions = result.scalars().all()
    
    return transactions


@router.post("/transactions/{transaction_id}/approve")
async def approve_transaction(
    transaction_id: str,
    approval_data: WithdrawalApprovalRequest,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Approve transaction (mainly for withdrawals)"""
    
    transaction = await db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.status != TransactionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transaction is not pending")
    
    # Update transaction
    transaction.status = TransactionStatus.COMPLETED
    transaction.approved_by = admin_user.id
    transaction.approved_at = datetime.utcnow()
    transaction.admin_notes = approval_data.notes
    transaction.completed_at = datetime.utcnow()
    
    await db.commit()
    
    # Log admin action
    await log_admin_action(
        admin_user.id,
        "approve_transaction",
        "transaction",
        transaction_id,
        {"notes": approval_data.notes},
        db
    )
    
    # Notify user
    await telegram_bot_service.notify_transaction_completed(transaction)
    
    return {"message": "Transaction approved successfully"}


@router.post("/transactions/{transaction_id}/reject")
async def reject_transaction(
    transaction_id: str,
    rejection_reason: str,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Reject transaction"""
    
    transaction = await db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.status != TransactionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transaction is not pending")
    
    # Update transaction
    transaction.status = TransactionStatus.REJECTED
    transaction.approved_by = admin_user.id
    transaction.approved_at = datetime.utcnow()
    transaction.rejection_reason = rejection_reason
    
    await db.commit()
    
    # Log admin action
    await log_admin_action(
        admin_user.id,
        "reject_transaction",
        "transaction",
        transaction_id,
        {"reason": rejection_reason},
        db
    )
    
    # Notify user
    user = await db.get(User, transaction.user_id)
    if user:
        await telegram_bot_service.send_message_to_user(
            user.telegram_id,
            f"❌ **Транзакция отклонена**\n\n"
            f"ID: {transaction.id[:8]}...\n"
            f"Причина: {rejection_reason}\n\n"
            f"Обратитесь в поддержку для получения дополнительной информации."
        )
    
    return {"message": "Transaction rejected successfully"}


# ================ ASSETS MANAGEMENT ================

@router.get("/assets", response_model=List[AdminAssetResponse])
async def get_admin_assets(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db),
    asset_type: Optional[AssetType] = None
):
    """Get assets for admin"""
    
    query = select(Asset)
    
    if asset_type:
        query = query.where(Asset.asset_type == asset_type)
    
    query = query.order_by(Asset.symbol)
    
    result = await db.execute(query)
    assets = result.scalars().all()
    
    return assets


@router.put("/assets/{asset_id}")
async def update_asset(
    asset_id: str,
    asset_update: dict,
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update asset"""
    
    asset = await db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    old_values = {}
    new_values = {}
    
    # Update allowed fields
    for field, value in asset_update.items():
        if hasattr(asset, field) and field not in ['id', 'created_at']:
            old_values[field] = getattr(asset, field)
            setattr(asset, field, value)
            new_values[field] = value
    
    asset.updated_at = datetime.utcnow()
    
    await db.commit()
    
    # Log admin action
    await log_admin_action(
        admin_user.id,
        "update_asset",
        "asset",
        asset_id,
        {"old_values": old_values, "new_values": new_values},
        db
    )
    
    return {"message": "Asset updated successfully"}


# ================ PLATFORM SETTINGS ================

@router.get("/settings", response_model=List[PlatformSettingsResponse])
async def get_platform_settings(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db),
    category: Optional[str] = None
):
    """Get platform settings"""
    
    query = select(PlatformSettings)
    
    if category:
        query = query.where(PlatformSettings.category == category)
    
    query = query.order_by(PlatformSettings.category, PlatformSettings.key)
    
    result = await db.execute(query)
    settings = result.scalars().all()
    
    return settings


@router.put("/settings")
async def update_platform_settings(
    settings_update: List[PlatformSettingsUpdate],
    admin_user: User = Depends(get_current_super_admin_user),
    db: AsyncSession = Depends(get_async_db)
):
    """Update platform settings (Super Admin only)"""
    
    updated_settings = []
    
    for setting_update in settings_update:
        # Get setting
        result = await db.execute(
            select(PlatformSettings).where(PlatformSettings.key == setting_update.key)
        )
        setting = result.scalar_one_or_none()
        
        if setting:
            old_value = setting.value
            setting.value = setting_update.value
            setting.updated_at = datetime.utcnow()
            setting.updated_by = admin_user.id
            
            # Log admin action
            await log_admin_action(
                admin_user.id,
                "update_setting",
                "setting",
                setting.id,
                {"key": setting.key, "old_value": old_value, "new_value": setting_update.value},
                db
            )
            
            updated_settings.append(setting.key)
    
    await db.commit()
    
    return {"message": f"Updated {len(updated_settings)} settings", "updated": updated_settings}


# ================ AUDIT LOGS ================

@router.get("/audit-logs")
async def get_audit_logs(
    admin_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_async_db),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    action: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Get audit logs"""
    
    query = select(AuditLog)
    
    if action:
        query = query.where(AuditLog.action == action)
    
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    
    query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return logs


# ================ HELPER FUNCTIONS ================

async def log_admin_action(
    admin_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    metadata: Dict[str, Any],
    db: AsyncSession
):
    """Log admin action for audit trail"""
    
    audit_log = AuditLog(
        user_id=admin_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata=metadata,
        ip_address="unknown",  # Should be extracted from request
        success=True
    )
    
    db.add(audit_log)
    await db.commit()
