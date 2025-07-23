#!/bin/bash

# Crypto Trading Platform Backend Runner
echo "🚀 Starting Crypto Trading Platform Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Please update .env file with your configuration"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Start services based on argument
case $1 in
    "dev")
        echo "🛠️ Starting development server..."
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
        ;;
    "celery")
        echo "🔄 Starting Celery worker..."
        celery -A app.tasks.celery_app worker --loglevel=info
        ;;
    "beat")
        echo "⏰ Starting Celery beat..."
        celery -A app.tasks.celery_app beat --loglevel=info
        ;;
    "flower")
        echo "🌸 Starting Flower monitoring..."
        celery -A app.tasks.celery_app flower
        ;;
    "prod")
        echo "🚀 Starting production server..."
        gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
        ;;
    "docker")
        echo "🐳 Starting with Docker..."
        docker-compose up -d
        ;;
    "test")
        echo "🧪 Running tests..."
        pytest
        ;;
    *)
        echo "Usage: $0 {dev|celery|beat|flower|prod|docker|test}"
        echo ""
        echo "Commands:"
        echo "  dev     - Start development server with auto-reload"
        echo "  celery  - Start Celery worker"
        echo "  beat    - Start Celery beat scheduler"
        echo "  flower  - Start Flower monitoring interface"
        echo "  prod    - Start production server with Gunicorn"
        echo "  docker  - Start all services with Docker Compose"
        echo "  test    - Run test suite"
        exit 1
        ;;
esac
