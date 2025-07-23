# Backend Deployment Guide

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install requirements
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Run migrations
alembic upgrade head

# Or create tables manually
python -c "from app.db.database import create_tables; import asyncio; asyncio.run(create_tables())"
```

### 4. Test Backend

```bash
# Run startup test
python scripts/test_startup.py

# Start development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Verify Installation

Visit `http://localhost:8000/docs` for API documentation.

## Production Deployment

### Using Docker

```bash
# Build image
docker build -t crypto-trading-backend .

# Run with docker-compose
docker-compose up -d
```

### Manual Deployment

```bash
# Start with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your_supabase_key

# Security
SECRET_KEY=your-super-secret-key-change-in-production

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_ID=your_admin_telegram_id

# Alpha Vantage (for price data)
ALPHA_VANTAGE_API_KEY=your_api_key

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379/0
```

### Optional Variables

```env
# Environment
ENVIRONMENT=production
DEBUG=false
HOST=0.0.0.0
PORT=8000

# CORS
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Email (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@your-domain.com
```

## Features Included

### ✅ User Management
- Telegram authentication
- User profiles and preferences
- Portfolio tracking
- Transaction history

### ✅ Trading System
- Real-time asset prices (Alpha Vantage)
- Market and limit orders
- Buy/sell operations
- Fee calculations
- Balance management

### ✅ Notification System
- In-app notifications
- Telegram notifications
- Price alerts
- Trading notifications
- Admin broadcasts

### ✅ Admin Panel
- User management
- Transaction approval
- Asset management
- Platform statistics
- Audit logging

### ✅ Telegram Bot Integration
- User registration via Telegram
- Balance and portfolio checks
- Real-time notifications
- Admin commands
- Web app integration

### ✅ Security Features
- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention
- CORS protection
- Security headers

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/telegram` | POST | Telegram authentication |
| `/api/v1/users/me` | GET | Get current user |
| `/api/v1/users/portfolio` | GET | Get user portfolio |
| `/api/v1/trading/assets` | GET | List trading assets |
| `/api/v1/trading/orders` | POST | Create trading order |
| `/api/v1/notifications` | GET | Get notifications |
| `/api/v1/notifications/price-alerts` | POST | Create price alert |
| `/api/v1/admin/dashboard` | GET | Admin dashboard |

Full API documentation available at `/docs` when running in development mode.

## Background Services

### Celery Workers (Optional)

```bash
# Start Celery worker
celery -A app.tasks.celery_app worker --loglevel=info

# Start Celery beat (scheduler)
celery -A app.tasks.celery_app beat --loglevel=info

# Monitor with Flower
celery -A app.tasks.celery_app flower
```

### Telegram Bot

The Telegram bot runs automatically when the backend starts. Features:

- `/start` - User registration
- `/balance` - Check balance
- `/portfolio` - View portfolio
- `/alerts` - Manage price alerts
- `/admin` - Admin panel (admin only)

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `assets` - Trading assets (BTC, ETH, etc.)
- `orders` - Trading orders
- `transactions` - All financial transactions
- `notifications` - User notifications
- `price_alerts` - Custom price alerts

## Monitoring and Logging

### Health Check

```bash
curl http://localhost:8000/health
```

### Logs

Logs are written to both console and `app.log` file with rotation.

### Error Tracking

Sentry integration available (set `SENTRY_DSN` environment variable).

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test category
pytest tests/test_trading.py
pytest tests/test_admin.py
pytest tests/test_notifications.py
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Verify database server is running
   - Ensure firewall allows connections

2. **Telegram Bot Not Working**
   - Verify TELEGRAM_BOT_TOKEN is correct
   - Check bot is created via @BotFather
   - Ensure webhook URL is accessible (production)

3. **Price Data Not Updating**
   - Verify ALPHA_VANTAGE_API_KEY is valid
   - Check API rate limits
   - Ensure internet connectivity

4. **Import Errors**
   - Run `python scripts/test_startup.py`
   - Check Python version (3.8+ required)
   - Verify all dependencies installed

### Getting Help

1. Check logs in `app.log`
2. Run startup test script
3. Verify environment variables
4. Check database connectivity

## Performance Optimization

### Production Settings

```env
# Disable debug mode
DEBUG=false
ENVIRONMENT=production

# Enable database pooling
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Configure rate limiting
RATE_LIMIT_PER_MINUTE=120
```

### Caching

Redis caching is automatically enabled when `REDIS_URL` is set.

### Database Optimization

- Regular database maintenance
- Index optimization
- Query performance monitoring

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable database SSL
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

---

**Need Help?** Check the API documentation at `/docs` or refer to the main README.md file.
