# Crypto Trading Platform API Documentation

## Overview

Professional crypto trading platform backend with comprehensive REST API, Telegram bot integration, real-time trading functionality, and administrative panel.

**Base URL**: `http://localhost:8000/api/v1`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

## Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Trading Operations](#trading-operations)
- [Notifications](#notifications)
- [Admin Panel](#admin-panel)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

### Telegram Authentication

```http
POST /auth/telegram
```

**Request Body:**

```json
{
  "init_data": "telegram_web_app_init_data",
  "hash": "telegram_hash"
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "user_uuid",
    "telegram_id": "123456789",
    "username": "user123",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

## User Management

### Get Current User Info

```http
GET /api/v1/users/me
Authorization: Bearer {token}
```

**Response:**

```json
{
  "id": "user_uuid",
  "telegram_id": "123456789",
  "username": "user123",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "status": "active",
  "user_type": "regular",
  "balance": "1000.00",
  "referral_code": "REF123",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update User Profile

```http
PUT /api/v1/users/me
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "newuser@example.com",
  "phone": "+1234567891"
}
```

### Get User Portfolio

```http
GET /api/v1/users/portfolio
Authorization: Bearer {token}
```

**Response:**

```json
{
  "total_value": "5000.00",
  "total_balance": "1000.00",
  "total_profit_loss": "250.00",
  "profit_loss_percentage": 5.25,
  "holdings": [
    {
      "asset_id": "btc",
      "asset_symbol": "BTC",
      "asset_name": "Bitcoin",
      "quantity": "0.1",
      "average_price": "45000.00",
      "current_price": "47000.00",
      "total_value": "4700.00",
      "profit_loss": "200.00",
      "profit_loss_percentage": 4.44
    }
  ]
}
```

### Get Transaction History

```http
GET /api/v1/users/transactions?limit=50&offset=0&type=all
Authorization: Bearer {token}
```

**Response:**

```json
{
  "transactions": [
    {
      "id": "transaction_uuid",
      "type": "buy",
      "asset_symbol": "BTC",
      "quantity": "0.1",
      "price": "45000.00",
      "total_amount": "4500.00",
      "fee": "4.50",
      "status": "completed",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

## Trading Operations

### Get Available Assets

```http
GET /api/v1/trading/assets?limit=50&offset=0&search=BTC
```

**Response:**

```json
{
  "assets": [
    {
      "id": "btc",
      "symbol": "BTC",
      "name": "Bitcoin",
      "current_price": "47000.00",
      "price_change_24h": "1250.00",
      "price_change_percentage_24h": 2.73,
      "market_cap": "900000000000",
      "volume_24h": "25000000000",
      "is_active": true,
      "description": "The original cryptocurrency"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### Get Asset Details

```http
GET /api/v1/trading/assets/{asset_id}
```

**Response:**

```json
{
  "id": "btc",
  "symbol": "BTC",
  "name": "Bitcoin",
  "current_price": "47000.00",
  "price_change_24h": "1250.00",
  "price_change_percentage_24h": 2.73,
  "market_cap": "900000000000",
  "volume_24h": "25000000000",
  "high_24h": "48000.00",
  "low_24h": "44000.00",
  "supply": "19500000",
  "max_supply": "21000000",
  "is_active": true,
  "description": "The original cryptocurrency"
}
```

### Create Order

```http
POST /api/v1/trading/orders
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "asset_id": "btc",
  "order_type": "market",
  "side": "buy",
  "quantity": "0.1",
  "price": null
}
```

**Response:**

```json
{
  "id": "order_uuid",
  "user_id": "user_uuid",
  "asset_id": "btc",
  "order_type": "market",
  "side": "buy",
  "quantity": "0.1",
  "price": "47000.00",
  "total_amount": "4700.00",
  "fee": "4.70",
  "status": "completed",
  "filled_quantity": "0.1",
  "remaining_quantity": "0.0",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:01Z"
}
```

### Get User Orders

```http
GET /api/v1/trading/orders?status=all&limit=50&offset=0
Authorization: Bearer {token}
```

### Cancel Order

```http
DELETE /api/v1/trading/orders/{order_id}
Authorization: Bearer {token}
```

### Create Deposit

```http
POST /api/v1/trading/deposits
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "amount": "1000.00",
  "payment_method": "bank_transfer"
}
```

### Create Withdrawal

```http
POST /api/v1/trading/withdrawals
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "amount": "500.00",
  "withdrawal_method": "bank_transfer",
  "destination": "bank_account_info"
}
```

### Get Price History

```http
GET /api/v1/trading/assets/{asset_id}/price-history?interval=1h&limit=24
```

**Response:**

```json
{
  "asset_id": "btc",
  "interval": "1h",
  "prices": [
    {
      "timestamp": "2024-01-01T00:00:00Z",
      "open": "46000.00",
      "high": "46500.00",
      "low": "45800.00",
      "close": "46200.00",
      "volume": "1000000"
    }
  ]
}
```

---

## Notifications

### Get User Notifications

```http
GET /api/v1/notifications?limit=50&offset=0&unread_only=false
Authorization: Bearer {token}
```

**Response:**

```json
{
  "notifications": [
    {
      "id": "notification_uuid",
      "user_id": "user_uuid",
      "type": "trading",
      "title": "Order Completed",
      "message": "Your BTC buy order has been completed",
      "priority": "normal",
      "is_read": false,
      "is_actionable": true,
      "action_url": "/portfolio",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "unread_count": 5,
  "limit": 50,
  "offset": 0
}
```

### Mark Notification as Read

```http
PUT /api/v1/notifications/{notification_id}/read
Authorization: Bearer {token}
```

### Mark All Notifications as Read

```http
PUT /api/v1/notifications/read-all
Authorization: Bearer {token}
```

### Delete Notification

```http
DELETE /api/v1/notifications/{notification_id}
Authorization: Bearer {token}
```

### Create Price Alert

```http
POST /api/v1/notifications/price-alerts
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "asset_id": "btc",
  "condition_type": "above",
  "target_price": "50000.00",
  "is_recurring": false,
  "max_triggers": 1,
  "notify_telegram": true,
  "notify_email": false
}
```

### Get Price Alerts

```http
GET /api/v1/notifications/price-alerts?is_active=true
Authorization: Bearer {token}
```

### Update Price Alert

```http
PUT /api/v1/notifications/price-alerts/{alert_id}
Authorization: Bearer {token}
```

### Delete Price Alert

```http
DELETE /api/v1/notifications/price-alerts/{alert_id}
Authorization: Bearer {token}
```

---

## Admin Panel

### Admin Dashboard

```http
GET /api/v1/admin/dashboard
Authorization: Bearer {admin_token}
```

**Response:**

```json
{
  "total_users": 1500,
  "active_users": 1200,
  "total_volume_24h": "5000000.00",
  "total_trades_24h": 2500,
  "pending_withdrawals": 15,
  "pending_deposits": 8,
  "total_assets": 100,
  "active_assets": 95,
  "system_status": "healthy",
  "recent_activities": [
    {
      "type": "user_registration",
      "description": "New user registered",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Manage Users

```http
GET /api/v1/admin/users?status=active&limit=50&offset=0&search=user123
Authorization: Bearer {admin_token}
```

### Update User Status

```http
PUT /api/v1/admin/users/{user_id}/status
Authorization: Bearer {admin_token}
```

**Request Body:**

```json
{
  "status": "suspended",
  "reason": "Suspicious activity"
}
```

### Approve/Reject Withdrawal

```http
PUT /api/v1/admin/withdrawals/{withdrawal_id}/approve
Authorization: Bearer {admin_token}
```

**Request Body:**

```json
{
  "action": "approve",
  "admin_notes": "Verified and approved"
}
```

### Manage Assets

```http
GET /api/v1/admin/assets
Authorization: Bearer {admin_token}
```

### Update Asset

```http
PUT /api/v1/admin/assets/{asset_id}
Authorization: Bearer {admin_token}
```

**Request Body:**

```json
{
  "is_active": true,
  "trading_enabled": true,
  "minimum_trade_amount": "10.00",
  "maximum_trade_amount": "100000.00"
}
```

### Broadcast Notification

```http
POST /api/v1/notifications/admin/broadcast
Authorization: Bearer {admin_token}
```

**Request Body:**

```json
{
  "title": "System Maintenance",
  "message": "The platform will undergo maintenance from 2-4 AM UTC",
  "type": "news",
  "priority": "high",
  "channels": ["telegram", "in_app"]
}
```

### Get Admin Statistics

```http
GET /api/v1/admin/stats
Authorization: Bearer {admin_token}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": true,
  "message": "Error description",
  "status_code": 400,
  "details": {
    "field": "Specific error details"
  }
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Too Many Requests
- **500**: Internal Server Error

---

## Rate Limiting

- Default: 60 requests per minute per IP
- Authenticated users: 120 requests per minute
- Admin endpoints: 200 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1609459200
```

---

## WebSocket Endpoints (Future Implementation)

### Real-time Price Updates

```
ws://localhost:8000/ws/prices
```

### User Notifications

```
ws://localhost:8000/ws/notifications/{user_id}?token={jwt_token}
```

### Order Updates

```
ws://localhost:8000/ws/orders/{user_id}?token={jwt_token}
```

---

## Telegram Bot Integration

The platform includes a comprehensive Telegram bot for user interactions:

### Bot Commands

- `/start` - Initialize bot and register user
- `/balance` - Check account balance
- `/portfolio` - View portfolio summary
- `/alerts` - Manage price alerts
- `/help` - Show available commands
- `/admin` - Admin panel access (admins only)

### Bot Features

- **User Registration**: Seamless registration through Telegram
- **Real-time Notifications**: Trading alerts, price alerts, system notifications
- **Portfolio Management**: Quick balance and portfolio checks
- **Admin Notifications**: System alerts and user management
- **Price Alerts**: Custom price alerts with Telegram delivery
- **Web App Integration**: Inline keyboard buttons for web app access

---

## Development Setup

1. **Environment Variables**: Copy `.env.example` to `.env` and configure
2. **Database**: Set up PostgreSQL (Supabase recommended)
3. **Redis**: Configure Redis for caching and Celery
4. **Telegram Bot**: Create bot via @BotFather and set token
5. **Alpha Vantage**: Get API key for real-time price data

### Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the application
python app/main.py

# Or using uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

---

## Production Deployment

### Docker

```bash
# Build image
docker build -t crypto-trading-backend .

# Run container
docker run -p 8000:8000 crypto-trading-backend
```

### Docker Compose

```bash
# Start all services
docker-compose up -d
```

---

## Security Considerations

- JWT tokens with proper expiration
- Rate limiting on all endpoints
- Input validation and sanitization
- HTTPS in production
- Environment variable protection
- SQL injection prevention via SQLModel
- CORS configuration
- Security headers middleware

---

## Support and Documentation

For additional support or questions:

- **API Documentation**: Available at `/docs` (development only)
- **ReDoc**: Available at `/redoc` (development only)
- **Health Check**: `GET /health`
- **API Status**: `GET /api/v1/`

---

_Last Updated: January 2024_
_API Version: 1.0.0_
