#!/usr/bin/env python3
"""
MT5 Trade History Sync Client
Connects to MetaTrader5 and syncs deal history to backend API every 5 minutes.
"""

import os
import sys
import time
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import json

try:
    import MetaTrader5 as mt5
    import requests
    from dotenv import load_dotenv
    import schedule
except ImportError as e:
    print(f"Error: Missing required package: {e}")
    print("Please run the installation script first.")
    sys.exit(1)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mt5_sync.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class MT5SyncClient:
    """MetaTrader5 trade history sync client."""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the sync client with configuration."""
        # Load environment variables
        if config_path:
            load_dotenv(config_path)
        else:
            load_dotenv()
        
        # MT5 Configuration
        self.mt5_login = int(os.getenv('MT5_LOGIN', 0))
        self.mt5_password = os.getenv('MT5_PASSWORD', '')
        self.mt5_server = os.getenv('MT5_SERVER', '')
        self.mt5_path = os.getenv('MT5_PATH', '')  # Optional, for Linux/Wine
        
        # API Configuration
        self.api_url = os.getenv('API_URL', 'http://localhost:8000')
        self.api_key = os.getenv('API_KEY', '')
        self.user_id = os.getenv('MT5_APP_USER_ID', '')
        
        # Sync Configuration
        self.sync_interval_minutes = int(os.getenv('SYNC_INTERVAL_MINUTES', 5))
        self.history_days = int(os.getenv('HISTORY_DAYS', 30))
        
        # Validate configuration
        self._validate_config()
        
        # Connection state
        self.is_connected = False
        self.last_sync_time = None
        
    def _validate_config(self):
        """Validate required configuration parameters."""
        if not self.mt5_login or self.mt5_login == 0:
            raise ValueError("MT5_LOGIN is required")
        if not self.mt5_password:
            raise ValueError("MT5_PASSWORD is required")
        if not self.mt5_server:
            raise ValueError("MT5_SERVER is required")
        if not self.api_url:
            raise ValueError("API_URL is required")
        if not self.api_key:
            raise ValueError("API_KEY is required")
        if not self.user_id:
            raise ValueError("MT5_APP_USER_ID is required")
    
    def connect_mt5(self) -> bool:
        """Connect to MetaTrader5 terminal."""
        try:
            # Initialize MT5 connection
            if self.mt5_path:
                # Linux/Wine: specify MT5 terminal path
                if not mt5.initialize(path=self.mt5_path):
                    logger.error(f"MT5 initialize() failed with path: {self.mt5_path}")
                    logger.error(f"Error code: {mt5.last_error()}")
                    return False
            else:
                # Windows: auto-detect
                if not mt5.initialize():
                    logger.error(f"MT5 initialize() failed")
                    logger.error(f"Error code: {mt5.last_error()}")
                    return False
            
            # Login to trading account
            authorized = mt5.login(
                login=self.mt5_login,
                password=self.mt5_password,
                server=self.mt5_server
            )
            
            if not authorized:
                logger.error(f"MT5 login failed for account {self.mt5_login}")
                logger.error(f"Error code: {mt5.last_error()}")
                mt5.shutdown()
                return False
            
            account_info = mt5.account_info()
            if account_info:
                logger.info(f"Connected to MT5 account: {account_info.login} ({account_info.server})")
                logger.info(f"Account balance: {account_info.balance} {account_info.currency}")
            
            self.is_connected = True
            return True
            
        except Exception as e:
            logger.error(f"Exception during MT5 connection: {e}")
            return False
    
    def disconnect_mt5(self):
        """Disconnect from MetaTrader5 terminal."""
        if self.is_connected:
            mt5.shutdown()
            self.is_connected = False
            logger.info("Disconnected from MT5")
    
    def fetch_deal_history(self) -> List[Dict[str, Any]]:
        """Fetch deal history from MT5."""
        if not self.is_connected:
            logger.warning("Not connected to MT5, attempting to reconnect...")
            if not self.connect_mt5():
                return []
        
        try:
            # Calculate date range
            date_to = datetime.now()
            date_from = date_to - timedelta(days=self.history_days)
            
            # Get deals
            deals = mt5.history_deals_get(date_from, date_to)
            
            if deals is None:
                logger.error(f"Failed to get deals, error code: {mt5.last_error()}")
                return []
            
            if len(deals) == 0:
                logger.info("No deals found in the specified period")
                return []
            
            logger.info(f"Fetched {len(deals)} deals from MT5")
            
            # Convert deals to dict format
            deals_list = []
            for deal in deals:
                deal_dict = {
                    'ticket': str(deal.ticket),  # Cast to string for payload compatibility
                    'order': deal.order,
                    'time': deal.time,
                    'time_msc': deal.time_msc,
                    'type': deal.type,
                    'entry': deal.entry,
                    'magic': deal.magic,
                    'position_id': deal.position_id,
                    'reason': deal.reason,
                    'volume': deal.volume,
                    'price': deal.price,
                    'commission': deal.commission,
                    'swap': deal.swap,
                    'profit': deal.profit,
                    'fee': deal.fee,
                    'symbol': deal.symbol,
                    'comment': deal.comment,
                    'external_id': deal.external_id,
                }
                deals_list.append(deal_dict)
            
            return deals_list
            
        except Exception as e:
            logger.error(f"Exception during deal fetch: {e}")
            return []
    
    def send_to_backend(self, deals: List[Dict[str, Any]]) -> bool:
        """Send deals to backend API."""
        if not deals:
            logger.info("No deals to send")
            return True
        
        try:
            url = f"{self.api_url.rstrip('/')}/api/trades/bulk"
            headers = {
                'X-API-Key': self.api_key,
                'Content-Type': 'application/json'
            }
            
            payload = {
                'user_id': int(self.user_id),  # Include user_id in payload
                'trades': deals,
                'account': self.mt5_login,
                'server': self.mt5_server
            }
            
            logger.info(f"Sending {len(deals)} deals to {url}")
            
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Successfully sent deals to backend: {result}")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send deals to backend: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response status: {e.response.status_code}")
                logger.error(f"Response body: {e.response.text}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending to backend: {e}")
            return False
    
    def sync_once(self):
        """Perform a single sync operation."""
        logger.info("=" * 60)
        logger.info("Starting sync operation...")
        
        try:
            # Fetch deals from MT5
            deals = self.fetch_deal_history()
            
            # Send to backend
            if deals:
                success = self.send_to_backend(deals)
                if success:
                    self.last_sync_time = datetime.now()
                    logger.info(f"Sync completed successfully at {self.last_sync_time}")
                else:
                    logger.warning("Sync completed with errors")
            else:
                logger.info("No deals to sync")
                self.last_sync_time = datetime.now()
            
        except Exception as e:
            logger.error(f"Error during sync: {e}")
        
        logger.info("=" * 60)
    
    def run_continuous(self):
        """Run continuous sync with scheduled intervals."""
        logger.info("=" * 60)
        logger.info("MT5 Trade History Sync Client")
        logger.info("=" * 60)
        logger.info(f"MT5 Account: {self.mt5_login}")
        logger.info(f"MT5 Server: {self.mt5_server}")
        logger.info(f"API URL: {self.api_url}")
        logger.info(f"Sync Interval: {self.sync_interval_minutes} minutes")
        logger.info(f"History Days: {self.history_days}")
        logger.info("=" * 60)
        
        # Connect to MT5
        if not self.connect_mt5():
            logger.error("Failed to connect to MT5. Exiting.")
            sys.exit(1)
        
        # Schedule sync job
        schedule.every(self.sync_interval_minutes).minutes.do(self.sync_once)
        
        # Run initial sync immediately
        logger.info("Running initial sync...")
        self.sync_once()
        
        # Run scheduled jobs
        logger.info(f"Sync scheduled every {self.sync_interval_minutes} minutes. Press Ctrl+C to stop.")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Received interrupt signal, shutting down...")
        finally:
            self.disconnect_mt5()
            logger.info("Client stopped")


def main():
    """Main entry point."""
    # Check for custom config file
    config_path = None
    if len(sys.argv) > 1:
        config_path = sys.argv[1]
        logger.info(f"Using config file: {config_path}")
    
    try:
        client = MT5SyncClient(config_path)
        client.run_continuous()
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        logger.error("Please check your .env file or environment variables")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
