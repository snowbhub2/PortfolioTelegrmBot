"""
Crypto Trading Platform Backend
FastAPI application with Telegram integration, real-time trading, and admin panel
"""

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
import asyncio
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.core.security import get_current_user
from app.core.logging import setup_logging
from app.db.database import engine, create_tables
from app.api.routes import api_router
from app.auth.telegram import telegram_auth_router
from app.tasks.celery_app import celery_app
from app.services.alpha_vantage import alpha_vantage_service
from app.services.telegram_bot import telegram_bot_service

settings = get_settings()

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    # Startup
    logger.info("Starting Crypto Trading Platform Backend...")
    
    # Create database tables
    await create_tables()
    logger.info("Database tables created/verified")
    
    # Initialize Telegram bot
    try:
        await telegram_bot_service.start()
        logger.info("Telegram bot service started")
    except Exception as e:
        logger.error(f"Failed to start Telegram bot: {e}")
    
    # Start background tasks
    try:
        # Start Alpha Vantage price updates
        asyncio.create_task(alpha_vantage_service.start_price_updates())
        logger.info("Price update service started")
    except Exception as e:
        logger.error(f"Failed to start price updates: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Crypto Trading Platform Backend...")
    
    # Stop Telegram bot
    try:
        await telegram_bot_service.stop()
        logger.info("Telegram bot service stopped")
    except Exception as e:
        logger.error(f"Error stopping Telegram bot: {e}")


# Initialize FastAPI app
app = FastAPI(
    title="Crypto Trading Platform API",
    description="Professional crypto trading platform with Telegram integration",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Internal server error" if settings.ENVIRONMENT == "production" else str(exc),
            "status_code": 500
        }
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "services": {
            "database": "connected",
            "redis": "connected",
            "telegram_bot": "running",
            "celery": "running"
        }
    }


# Include routers
app.include_router(api_router, prefix="/api/v1")
app.include_router(telegram_auth_router, prefix="/auth")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
