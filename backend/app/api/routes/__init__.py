"""
API Routes
"""

from fastapi import APIRouter
from .users import router as users_router
from .trading import router as trading_router
from .admin import router as admin_router
from .notifications import router as notifications_router

api_router = APIRouter()

# Include all routers
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(trading_router, prefix="/trading", tags=["Trading"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])

@api_router.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Crypto Trading Platform API",
        "version": "1.0.0",
        "status": "running"
    }
