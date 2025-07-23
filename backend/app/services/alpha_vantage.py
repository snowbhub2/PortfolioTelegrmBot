"""
Alpha Vantage API integration for real-time market data
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx
from decimal import Decimal

from app.core.config import get_settings
from app.models import Asset, PriceHistory
from app.db.database import AsyncSessionLocal
from sqlmodel import select

settings = get_settings()
logger = logging.getLogger(__name__)


class AlphaVantageService:
    """Service for Alpha Vantage API integration"""
    
    def __init__(self):
        self.base_url = settings.ALPHA_VANTAGE_BASE_URL
        self.api_key = settings.ALPHA_VANTAGE_API_KEY
        self.client = httpx.AsyncClient(timeout=30.0)
        self.rate_limit_delay = 12  # Alpha Vantage allows 5 requests per minute
        
    async def start_price_updates(self):
        """Start periodic price updates"""
        while True:
            try:
                await self.update_all_asset_prices()
                await asyncio.sleep(60)  # Update every minute
            except Exception as e:
                logger.error(f"Error in price update loop: {e}")
                await asyncio.sleep(60)
    
    async def get_crypto_price(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get cryptocurrency price data"""
        try:
            params = {
                "function": "DIGITAL_CURRENCY_DAILY",
                "symbol": symbol,
                "market": "USD",
                "apikey": self.api_key
            }
            
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if "Error Message" in data:
                logger.error(f"Alpha Vantage error for {symbol}: {data['Error Message']}")
                return None
            
            if "Note" in data:
                logger.warning(f"Alpha Vantage rate limit note: {data['Note']}")
                return None
            
            time_series = data.get("Time Series (Digital Currency Daily)", {})
            if not time_series:
                logger.warning(f"No time series data for {symbol}")
                return None
            
            # Get latest data
            latest_date = max(time_series.keys())
            latest_data = time_series[latest_date]
            
            return {
                "symbol": symbol,
                "price": float(latest_data["4a. close (USD)"]),
                "high": float(latest_data["2a. high (USD)"]),
                "low": float(latest_data["3a. low (USD)"]),
                "volume": float(latest_data["5. volume"]),
                "timestamp": datetime.strptime(latest_date, "%Y-%m-%d"),
                "market_cap": float(latest_data["6. market cap (USD)"]) if "6. market cap (USD)" in latest_data else None
            }
            
        except Exception as e:
            logger.error(f"Error fetching crypto price for {symbol}: {e}")
            return None
    
    async def get_stock_price(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get stock price data"""
        try:
            params = {
                "function": "TIME_SERIES_DAILY",
                "symbol": symbol,
                "apikey": self.api_key
            }
            
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if "Error Message" in data:
                logger.error(f"Alpha Vantage error for {symbol}: {data['Error Message']}")
                return None
            
            if "Note" in data:
                logger.warning(f"Alpha Vantage rate limit note: {data['Note']}")
                return None
            
            time_series = data.get("Time Series (Daily)", {})
            if not time_series:
                logger.warning(f"No time series data for {symbol}")
                return None
            
            # Get latest data
            latest_date = max(time_series.keys())
            latest_data = time_series[latest_date]
            
            return {
                "symbol": symbol,
                "price": float(latest_data["4. close"]),
                "high": float(latest_data["2. high"]),
                "low": float(latest_data["3. low"]),
                "volume": float(latest_data["5. volume"]),
                "timestamp": datetime.strptime(latest_date, "%Y-%m-%d"),
                "market_cap": None  # Not available for stocks in this endpoint
            }
            
        except Exception as e:
            logger.error(f"Error fetching stock price for {symbol}: {e}")
            return None
    
    async def get_asset_price(self, asset: Asset) -> Optional[Dict[str, Any]]:
        """Get price data for any asset"""
        if not asset.alpha_vantage_symbol:
            return None
        
        if asset.alpha_vantage_function == "DIGITAL_CURRENCY_DAILY":
            return await self.get_crypto_price(asset.alpha_vantage_symbol)
        elif asset.alpha_vantage_function == "TIME_SERIES_DAILY":
            return await self.get_stock_price(asset.alpha_vantage_symbol)
        else:
            logger.warning(f"Unknown Alpha Vantage function: {asset.alpha_vantage_function}")
            return None
    
    async def update_asset_price(self, asset: Asset) -> bool:
        """Update price for a single asset"""
        try:
            price_data = await self.get_asset_price(asset)
            if not price_data:
                return False
            
            async with AsyncSessionLocal() as db:
                # Calculate 24h change
                old_price = asset.current_price
                new_price = Decimal(str(price_data["price"]))
                
                if old_price > 0:
                    price_change = new_price - old_price
                    price_change_percent = (price_change / old_price) * 100
                else:
                    price_change = Decimal("0")
                    price_change_percent = Decimal("0")
                
                # Update asset
                asset.current_price = new_price
                asset.price_24h_change = price_change
                asset.price_24h_change_percent = price_change_percent
                asset.volume_24h = Decimal(str(price_data["volume"]))
                asset.last_price_update = datetime.utcnow()
                
                if price_data.get("market_cap"):
                    asset.market_cap = Decimal(str(price_data["market_cap"]))
                
                db.add(asset)
                
                # Add to price history
                price_history = PriceHistory(
                    asset_id=asset.id,
                    timestamp=price_data["timestamp"],
                    interval="1d",
                    open=new_price,  # We only have close price
                    high=Decimal(str(price_data["high"])),
                    low=Decimal(str(price_data["low"])),
                    close=new_price,
                    volume=Decimal(str(price_data["volume"]))
                )
                
                db.add(price_history)
                await db.commit()
                
                logger.info(f"Updated price for {asset.symbol}: ${new_price}")
                return True
                
        except Exception as e:
            logger.error(f"Error updating price for {asset.symbol}: {e}")
            return False
    
    async def update_all_asset_prices(self):
        """Update prices for all assets with Alpha Vantage integration"""
        try:
            async with AsyncSessionLocal() as db:
                # Get all assets with Alpha Vantage symbols
                result = await db.execute(
                    select(Asset).where(
                        Asset.alpha_vantage_symbol.isnot(None),
                        Asset.is_active == True
                    )
                )
                assets = result.scalars().all()
                
                logger.info(f"Updating prices for {len(assets)} assets")
                
                for asset in assets:
                    await self.update_asset_price(asset)
                    # Rate limiting - Alpha Vantage allows 5 requests per minute
                    await asyncio.sleep(self.rate_limit_delay)
                
                logger.info("Completed price update cycle")
                
        except Exception as e:
            logger.error(f"Error in update_all_asset_prices: {e}")
    
    async def get_historical_data(
        self, 
        symbol: str, 
        function: str = "TIME_SERIES_DAILY",
        outputsize: str = "compact"
    ) -> Optional[List[Dict[str, Any]]]:
        """Get historical price data"""
        try:
            params = {
                "function": function,
                "symbol": symbol,
                "outputsize": outputsize,
                "apikey": self.api_key
            }
            
            if function == "DIGITAL_CURRENCY_DAILY":
                params["market"] = "USD"
            
            response = await self.client.get(self.base_url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if "Error Message" in data:
                logger.error(f"Alpha Vantage error: {data['Error Message']}")
                return None
            
            if "Note" in data:
                logger.warning(f"Alpha Vantage rate limit note: {data['Note']}")
                return None
            
            # Extract time series data
            time_series_key = None
            for key in data.keys():
                if "Time Series" in key:
                    time_series_key = key
                    break
            
            if not time_series_key:
                logger.warning(f"No time series data found for {symbol}")
                return None
            
            time_series = data[time_series_key]
            historical_data = []
            
            for date_str, values in time_series.items():
                try:
                    # Handle different data formats
                    if function == "DIGITAL_CURRENCY_DAILY":
                        price_data = {
                            "date": date_str,
                            "open": float(values["1a. open (USD)"]),
                            "high": float(values["2a. high (USD)"]),
                            "low": float(values["3a. low (USD)"]),
                            "close": float(values["4a. close (USD)"]),
                            "volume": float(values["5. volume"])
                        }
                    else:
                        price_data = {
                            "date": date_str,
                            "open": float(values["1. open"]),
                            "high": float(values["2. high"]),
                            "low": float(values["3. low"]),
                            "close": float(values["4. close"]),
                            "volume": float(values["5. volume"])
                        }
                    
                    historical_data.append(price_data)
                    
                except (KeyError, ValueError) as e:
                    logger.warning(f"Error parsing data for {date_str}: {e}")
                    continue
            
            return sorted(historical_data, key=lambda x: x["date"])
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return None
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Global instance
alpha_vantage_service = AlphaVantageService()
