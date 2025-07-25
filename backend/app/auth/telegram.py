"""
Telegram authentication and integration
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional, Dict, Any
import hashlib
import hmac
import json
import logging
from datetime import datetime, timedelta

from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token
from app.models import User, UserSession
from app.models.user import UserRole, UserStatus
from app.db.database import get_async_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

settings = get_settings()
logger = logging.getLogger(__name__)

telegram_auth_router = APIRouter(tags=["Telegram Auth"])
security = HTTPBearer()


class TelegramAuthData(BaseModel):
    """Telegram authentication data"""
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str


class TelegramWebAppData(BaseModel):
    """Telegram Web App initialization data"""
    query_id: Optional[str] = None
    user: Optional[Dict[str, Any]] = None
    receiver: Optional[Dict[str, Any]] = None
    chat: Optional[Dict[str, Any]] = None
    chat_type: Optional[str] = None
    chat_instance: Optional[str] = None
    start_param: Optional[str] = None
    can_send_after: Optional[int] = None
    auth_date: int
    hash: str


class AuthResponse(BaseModel):
    """Authentication response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]


def verify_telegram_auth(auth_data: Dict[str, Any], bot_token: str) -> bool:
    """Verify Telegram authentication data"""
    try:
        # Remove hash from data
        received_hash = auth_data.pop('hash', '')
        
        # Create data check string
        data_check_arr = []
        for key, value in sorted(auth_data.items()):
            if key != 'hash':
                data_check_arr.append(f"{key}={value}")
        
        data_check_string = '\n'.join(data_check_arr)
        
        # Create secret key
        secret_key = hashlib.sha256(bot_token.encode()).digest()
        
        # Create hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return calculated_hash == received_hash
    
    except Exception as e:
        logger.error(f"Error verifying Telegram auth: {e}")
        return False


def verify_telegram_webapp_data(init_data: str, bot_token: str) -> bool:
    """Verify Telegram Web App initialization data"""
    try:
        # Parse init data
        parsed_data = {}
        for item in init_data.split('&'):
            if '=' in item:
                key, value = item.split('=', 1)
                parsed_data[key] = value
        
        # Get hash
        received_hash = parsed_data.pop('hash', '')
        
        # Create data check string
        data_check_arr = []
        for key, value in sorted(parsed_data.items()):
            data_check_arr.append(f"{key}={value}")
        
        data_check_string = '\n'.join(data_check_arr)
        
        # Create secret key
        secret_key = hmac.new(
            "WebAppData".encode(),
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Create hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return calculated_hash == received_hash
    
    except Exception as e:
        logger.error(f"Error verifying Telegram WebApp data: {e}")
        return False


async def get_or_create_user(telegram_data: Dict[str, Any], db: AsyncSession) -> User:
    """Get or create user from Telegram data"""
    telegram_id = telegram_data.get('id')
    
    # Try to find existing user
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id)
    )
    user = result.scalar_one_or_none()
    
    if user:
        # Update user data
        user.first_name = telegram_data.get('first_name')
        user.last_name = telegram_data.get('last_name')
        user.username = telegram_data.get('username')
        user.language_code = telegram_data.get('language_code', 'en')
        user.is_premium = telegram_data.get('is_premium', False)
        user.last_active = datetime.utcnow()
        user.last_login = datetime.utcnow()
        
        # Check if user should be admin
        if telegram_id == settings.TELEGRAM_ADMIN_ID:
            user.role = UserRole.ADMIN
        
        await db.commit()
        await db.refresh(user)
    else:
        # Create new user
        user_role = UserRole.ADMIN if telegram_id == settings.TELEGRAM_ADMIN_ID else UserRole.USER
        
        user = User(
            telegram_id=telegram_id,
            first_name=telegram_data.get('first_name'),
            last_name=telegram_data.get('last_name'),
            username=telegram_data.get('username'),
            language_code=telegram_data.get('language_code', 'en'),
            is_premium=telegram_data.get('is_premium', False),
            role=user_role,
            status=UserStatus.ACTIVE,
            last_active=datetime.utcnow(),
            last_login=datetime.utcnow()
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        logger.info(f"Created new user: {telegram_id} ({user.username})")
    
    return user


async def create_user_session(user: User, request: Request, db: AsyncSession) -> UserSession:
    """Create user session"""
    # Generate tokens
    access_token = create_access_token(data={"sub": user.id, "telegram_id": user.telegram_id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Create session
    session = UserSession(
        user_id=user.id,
        session_token=access_token,
        refresh_token=refresh_token,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return session


@telegram_auth_router.post("/telegram/auth", response_model=AuthResponse)
async def telegram_auth(
    auth_data: TelegramAuthData,
    request: Request,
    db: AsyncSession = Depends(get_async_db)
):
    """Authenticate user via Telegram Login Widget"""
    
    # Verify auth data
    auth_dict = auth_data.dict()
    if not verify_telegram_auth(auth_dict, settings.TELEGRAM_BOT_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid Telegram authentication")
    
    # Check auth date (should be within 24 hours)
    auth_time = datetime.fromtimestamp(auth_data.auth_date)
    if datetime.utcnow() - auth_time > timedelta(hours=24):
        raise HTTPException(status_code=401, detail="Authentication data is too old")
    
    # Get or create user
    user = await get_or_create_user(auth_dict, db)
    
    # Create session
    session = await create_user_session(user, request, db)
    
    # Return tokens
    return AuthResponse(
        access_token=session.session_token,
        refresh_token=session.refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "telegram_id": user.telegram_id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "status": user.status,
            "verification_level": user.verification_level
        }
    )


@telegram_auth_router.post("/telegram/webapp", response_model=AuthResponse)
async def telegram_webapp_auth(
    request: Request,
    db: AsyncSession = Depends(get_async_db)
):
    """Authenticate user via Telegram Web App"""
    
    # Get init data from headers or body
    init_data = request.headers.get("x-telegram-web-app-init-data")
    if not init_data:
        body = await request.body()
        data = json.loads(body) if body else {}
        init_data = data.get("initData")
    
    if not init_data:
        raise HTTPException(status_code=400, detail="Missing Telegram Web App init data")
    
    # Verify init data
    if not verify_telegram_webapp_data(init_data, settings.TELEGRAM_BOT_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid Telegram Web App data")
    
    # Parse user data
    parsed_data = {}
    for item in init_data.split('&'):
        if '=' in item:
            key, value = item.split('=', 1)
            parsed_data[key] = value
    
    user_data = json.loads(parsed_data.get('user', '{}'))
    if not user_data:
        raise HTTPException(status_code=400, detail="No user data in init data")
    
    # Check auth date
    auth_date = int(parsed_data.get('auth_date', 0))
    auth_time = datetime.fromtimestamp(auth_date)
    if datetime.utcnow() - auth_time > timedelta(hours=24):
        raise HTTPException(status_code=401, detail="Authentication data is too old")
    
    # Get or create user
    user = await get_or_create_user(user_data, db)
    
    # Create session
    session = await create_user_session(user, request, db)
    
    # Return tokens
    return AuthResponse(
        access_token=session.session_token,
        refresh_token=session.refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "telegram_id": user.telegram_id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "status": user.status,
            "verification_level": user.verification_level
        }
    )


@telegram_auth_router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_async_db)
):
    """Refresh access token"""
    
    # Find session by refresh token
    result = await db.execute(
        select(UserSession).where(
            UserSession.refresh_token == refresh_token,
            UserSession.is_active == True
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    # Check if session is expired
    if session.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_result = await db.execute(
        select(User).where(User.id == session.user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Generate new tokens
    new_access_token = create_access_token(
        data={"sub": user.id, "telegram_id": user.telegram_id}
    )
    new_refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Update session
    session.session_token = new_access_token
    session.refresh_token = new_refresh_token
    session.expires_at = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    session.last_used = datetime.utcnow()
    
    await db.commit()
    
    return AuthResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "telegram_id": user.telegram_id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "status": user.status,
            "verification_level": user.verification_level
        }
    )


@telegram_auth_router.post("/logout")
async def logout(
    request: Request,
    db: AsyncSession = Depends(get_async_db),
    token: str = Depends(security)
):
    """Logout user and invalidate session"""
    
    # Find and deactivate session
    result = await db.execute(
        select(UserSession).where(
            UserSession.session_token == token.credentials,
            UserSession.is_active == True
        )
    )
    session = result.scalar_one_or_none()
    
    if session:
        session.is_active = False
        await db.commit()
    
    return {"message": "Logged out successfully"}
