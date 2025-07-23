"""
Application configuration using Pydantic Settings
"""

from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import List, Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    PROJECT_NAME: str = "Crypto Trading Platform"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Professional crypto trading platform with Telegram integration"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Security
    SECRET_KEY: str = Field(env="SECRET_KEY", default="your-super-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440, env="ACCESS_TOKEN_EXPIRE_MINUTES")  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=30, env="REFRESH_TOKEN_EXPIRE_DAYS")
    ALGORITHM: str = "HS256"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "https://your-domain.com"],
        env="ALLOWED_ORIGINS"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["localhost", "127.0.0.1", "your-domain.com"],
        env="ALLOWED_HOSTS"
    )
    
    # Database (Supabase PostgreSQL)
    DATABASE_URL: str = Field(
        env="DATABASE_URL",
        default="postgresql://postgres:password@zwbnpukhgetmqcvevhhk.supabase.co:5432/postgres"
    )
    SUPABASE_URL: str = Field(
        env="SUPABASE_URL",
        default="https://zwbnpukhgetmqcvevhhk.supabase.co"
    )
    SUPABASE_API_KEY: str = Field(
        env="SUPABASE_API_KEY",
        default="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3Ym5wdWtoZ2V0bXFjdmV2aGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzk5MTcsImV4cCI6MjA2ODg1NTkxN30.tFFjq2KB3oz_vcaL9vvysju28rL6M_4R1Y7EIo_fULU"
    )
    
    # Redis
    REDIS_URL: str = Field(
        env="REDIS_URL",
        default="redis://localhost:6379/0"
    )
    
    # Celery
    CELERY_BROKER_URL: str = Field(
        env="CELERY_BROKER_URL",
        default="redis://localhost:6379/1"
    )
    CELERY_RESULT_BACKEND: str = Field(
        env="CELERY_RESULT_BACKEND",
        default="redis://localhost:6379/2"
    )
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = Field(
        env="TELEGRAM_BOT_TOKEN",
        default="7583253418:AAE8FfyJRoUKsPJyYKUvmJjGBRsVNaMLC_w"
    )
    TELEGRAM_WEBHOOK_URL: Optional[str] = Field(env="TELEGRAM_WEBHOOK_URL", default=None)
    TELEGRAM_ADMIN_ID: int = Field(env="TELEGRAM_ADMIN_ID", default=8103090312)
    
    # Alpha Vantage API
    ALPHA_VANTAGE_API_KEY: str = Field(
        env="ALPHA_VANTAGE_API_KEY",
        default="WXQQ5D56DW1XH92C"
    )
    ALPHA_VANTAGE_BASE_URL: str = "https://www.alphavantage.co/query"
    
    # Trading settings
    DEFAULT_TRADING_FEE: float = Field(default=0.001, env="DEFAULT_TRADING_FEE")  # 0.1%
    DEFAULT_WITHDRAWAL_FEE: float = Field(default=0.005, env="DEFAULT_WITHDRAWAL_FEE")  # 0.5%
    MIN_TRADE_AMOUNT: float = Field(default=1.0, env="MIN_TRADE_AMOUNT")
    MAX_TRADE_AMOUNT: float = Field(default=100000.0, env="MAX_TRADE_AMOUNT")
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # File uploads
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=["image/jpeg", "image/png", "image/webp", "application/pdf"],
        env="ALLOWED_FILE_TYPES"
    )
    
    # Email settings (optional)
    SMTP_SERVER: Optional[str] = Field(env="SMTP_SERVER", default=None)
    SMTP_PORT: Optional[int] = Field(env="SMTP_PORT", default=587)
    SMTP_USERNAME: Optional[str] = Field(env="SMTP_USERNAME", default=None)
    SMTP_PASSWORD: Optional[str] = Field(env="SMTP_PASSWORD", default=None)
    FROM_EMAIL: Optional[str] = Field(env="FROM_EMAIL", default=None)
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("ALLOWED_HOSTS", pre=True)
    def parse_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v
    
    @validator("ALLOWED_FILE_TYPES", pre=True)
    def parse_file_types(cls, v):
        if isinstance(v, str):
            return [file_type.strip() for file_type in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
