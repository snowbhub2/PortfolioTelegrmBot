"""
Celery application configuration
"""

from celery import Celery
import os
from app.core.config import get_settings

settings = get_settings()

# Create Celery app
celery_app = Celery(
    "crypto_trading_platform",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.trading",
        "app.tasks.notifications",
        "app.tasks.maintenance"
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task routing
    task_routes={
        "app.tasks.trading.*": {"queue": "trading"},
        "app.tasks.notifications.*": {"queue": "notifications"},
        "app.tasks.maintenance.*": {"queue": "maintenance"},
    },
    
    # Beat schedule for periodic tasks
    beat_schedule={
        # Update asset prices every minute
        "update-asset-prices": {
            "task": "app.tasks.trading.update_asset_prices",
            "schedule": 60.0,  # Every 60 seconds
        },
        
        # Send pending notifications every 30 seconds
        "send-pending-notifications": {
            "task": "app.tasks.notifications.send_pending_notifications",
            "schedule": 30.0,
        },
        
        # Clean expired sessions every hour
        "clean-expired-sessions": {
            "task": "app.tasks.maintenance.clean_expired_sessions",
            "schedule": 3600.0,  # Every hour
        },
        
        # Generate daily reports at midnight
        "generate-daily-reports": {
            "task": "app.tasks.maintenance.generate_daily_reports",
            "schedule": crontab(hour=0, minute=0),  # Midnight UTC
        },
        
        # Check for pending withdrawals every 5 minutes
        "check-pending-withdrawals": {
            "task": "app.tasks.trading.check_pending_withdrawals",
            "schedule": 300.0,  # Every 5 minutes
        }
    },
    
    # Task settings
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=50,
    
    # Result backend settings
    result_expires=3600,  # 1 hour
    result_persistent=True,
)

# Import crontab for scheduled tasks
from celery.schedules import crontab

# Update beat schedule with crontab
celery_app.conf.beat_schedule.update({
    "generate-daily-reports": {
        "task": "app.tasks.maintenance.generate_daily_reports",
        "schedule": crontab(hour=0, minute=0),
    },
    "weekly-cleanup": {
        "task": "app.tasks.maintenance.weekly_cleanup",
        "schedule": crontab(hour=2, minute=0, day_of_week=1),  # Monday 2 AM
    },
})

if __name__ == "__main__":
    celery_app.start()
