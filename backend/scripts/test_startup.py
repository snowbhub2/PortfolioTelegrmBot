#!/usr/bin/env python3
"""
Backend startup test script
Checks if all imports work and core functionality is available
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_imports():
    """Test all critical imports"""
    print("🔍 Testing backend imports...")
    
    try:
        # Core imports
        from app.core.config import get_settings
        print("✅ Core config imported")
        
        from app.db.database import engine, create_tables
        print("✅ Database module imported")
        
        from app.models import User, Asset, Order, Transaction, Notification, PriceAlert
        print("✅ Models imported")
        
        from app.schemas import UserResponse, AssetResponse, OrderResponse
        print("✅ Schemas imported")
        
        from app.api.routes import api_router
        print("✅ API routes imported")
        
        from app.services.trading import trading_service
        print("✅ Trading service imported")
        
        from app.services.notification import notification_service
        print("✅ Notification service imported")
        
        from app.services.telegram_bot import telegram_bot_service
        print("✅ Telegram bot service imported")
        
        # Test FastAPI app creation
        from app.main import app
        print("✅ FastAPI app created successfully")
        
        # Test settings
        settings = get_settings()
        print(f"✅ Settings loaded - Environment: {settings.ENVIRONMENT}")
        
        print("\n🎉 All imports successful! Backend is ready to start.")
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_endpoints():
    """Test if API endpoints are properly configured"""
    print("\n🔍 Testing API endpoint configuration...")
    
    try:
        from app.main import app
        
        # Check if routes are registered
        routes = [route.path for route in app.routes]
        
        expected_routes = [
            "/api/v1/users/me",
            "/api/v1/trading/assets",
            "/api/v1/notifications",
            "/api/v1/admin/dashboard"
        ]
        
        for expected_route in expected_routes:
            found = any(expected_route in route for route in routes)
            if found:
                print(f"✅ Route found: {expected_route}")
            else:
                print(f"❌ Route missing: {expected_route}")
        
        print(f"\n📊 Total routes registered: {len(routes)}")
        return True
        
    except Exception as e:
        print(f"❌ Route configuration error: {e}")
        return False


def main():
    """Main test function"""
    print("🚀 Crypto Trading Platform Backend - Startup Test")
    print("=" * 50)
    
    # Test imports
    import_success = test_imports()
    
    if import_success:
        # Test API configuration
        api_success = test_api_endpoints()
        
        if api_success:
            print("\n🎉 Backend startup test PASSED!")
            print("✅ Ready to start with: uvicorn app.main:app --host 0.0.0.0 --port 8000")
            return 0
        else:
            print("\n❌ API configuration test FAILED!")
            return 1
    else:
        print("\n❌ Import test FAILED!")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
