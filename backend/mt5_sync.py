from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from metaapi_cloud_sdk import MetaApi
import models
from database import get_settings
import asyncio
import logging

logger = logging.getLogger(__name__)
settings = get_settings()


class MT5Syncer:
    def __init__(self):
        self.api = MetaApi(settings.metaapi_token)
    
    async def sync_user_trades(self, user: models.User, db: Session) -> Dict[str, any]:
        """
        Sync trades from MT5 account for a specific user
        Returns: dict with sync statistics
        """
        if not user.mt5_account_id:
            return {"error": "No MT5 account configured", "synced": 0, "new": 0, "updated": 0}
        
        try:
            # Get account from MetaApi
            account = await self.api.metatrader_account_api.get_account(user.mt5_account_id)
            
            # Wait for account to deploy and connect
            await account.deploy()
            await account.wait_connected()
            
            # Get RPC connection
            connection = account.get_rpc_connection()
            await connection.connect()
            await connection.wait_synchronized()
            
            # Get deal history (closed trades)
            history = await connection.get_deals_history(
                start_time=datetime(2020, 1, 1),  # Adjust as needed
                end_time=datetime.utcnow()
            )
            
            synced_count = 0
            new_count = 0
            updated_count = 0
            
            for deal in history:
                # Skip non-trading deals (deposits, balance operations, etc.)
                if deal.get('type') not in ['DEAL_TYPE_BUY', 'DEAL_TYPE_SELL']:
                    continue
                
                # Map deal to our trade model
                ticket = str(deal.get('positionId', deal.get('id')))
                
                # Check if trade exists
                existing_trade = db.query(models.Trade).filter(
                    models.Trade.ticket == ticket,
                    models.Trade.user_id == user.id
                ).first()
                
                # Determine trade type
                trade_type = models.TradeType.BUY if deal.get('type') == 'DEAL_TYPE_BUY' else models.TradeType.SELL
                
                if existing_trade:
                    # Update existing trade
                    existing_trade.symbol = deal.get('symbol', existing_trade.symbol)
                    existing_trade.profit = deal.get('profit', existing_trade.profit)
                    existing_trade.volume = deal.get('volume', existing_trade.volume)
                    existing_trade.close_price = deal.get('price', existing_trade.close_price)
                    existing_trade.commission = deal.get('commission', existing_trade.commission)
                    existing_trade.swap = deal.get('swap', existing_trade.swap)
                    existing_trade.close_time = deal.get('time', existing_trade.close_time)
                    updated_count += 1
                else:
                    # Create new trade
                    new_trade = models.Trade(
                        ticket=ticket,
                        symbol=deal.get('symbol', ''),
                        type=trade_type,
                        open_time=deal.get('time', datetime.utcnow()),
                        close_time=deal.get('time', datetime.utcnow()),
                        profit=deal.get('profit', 0.0),
                        volume=deal.get('volume', 0.0),
                        open_price=deal.get('price', 0.0),
                        close_price=deal.get('price', 0.0),
                        commission=deal.get('commission', 0.0),
                        swap=deal.get('swap', 0.0),
                        user_id=user.id
                    )
                    db.add(new_trade)
                    new_count += 1
                
                synced_count += 1
            
            db.commit()
            
            # Close connection
            await connection.close()
            
            return {
                "success": True,
                "synced": synced_count,
                "new": new_count,
                "updated": updated_count,
                "total_trades": db.query(models.Trade).filter(models.Trade.user_id == user.id).count()
            }
            
        except Exception as e:
            logger.error(f"Error syncing MT5 trades for user {user.id}: {str(e)}")
            db.rollback()
            return {
                "success": False,
                "error": str(e),
                "synced": 0,
                "new": 0,
                "updated": 0
            }
    
    async def sync_all_users(self, db: Session) -> List[Dict]:
        """
        Sync trades for all users with MT5 accounts configured
        """
        users = db.query(models.User).filter(models.User.mt5_account_id.isnot(None)).all()
        results = []
        
        for user in users:
            logger.info(f"Syncing trades for user {user.email}")
            result = await self.sync_user_trades(user, db)
            results.append({
                "user_id": user.id,
                "email": user.email,
                **result
            })
        
        return results


# Singleton instance
_syncer = None

def get_mt5_syncer() -> MT5Syncer:
    """Get or create MT5 syncer singleton"""
    global _syncer
    if _syncer is None:
        _syncer = MT5Syncer()
    return _syncer
