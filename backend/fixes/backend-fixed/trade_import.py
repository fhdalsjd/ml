from datetime import datetime
from typing import List, Dict
from sqlalchemy.orm import Session
import models
import logging

logger = logging.getLogger(__name__)


def import_trades_bulk(trades_data: List[Dict], user_id: int, db: Session) -> Dict[str, any]:
    """
    Import trades in bulk from external MT5 client
    Returns: dict with import statistics
    """
    try:
        imported_count = 0
        new_count = 0
        updated_count = 0
        skipped_count = 0
        errors = []
        
        for trade_data in trades_data:
            try:
                ticket = str(trade_data.get('ticket'))
                
                if not ticket:
                    skipped_count += 1
                    errors.append(f"Trade missing ticket number")
                    continue
                
                # Check if trade exists
                existing_trade = db.query(models.Trade).filter(
                    models.Trade.ticket == ticket,
                    models.Trade.user_id == user_id
                ).first()
                
                # Map trade type
                trade_type_str = trade_data.get('type', '').upper()
                if trade_type_str not in ['BUY', 'SELL']:
                    skipped_count += 1
                    errors.append(f"Invalid trade type for ticket {ticket}: {trade_type_str}")
                    continue
                
                trade_type = models.TradeType.BUY if trade_type_str == 'BUY' else models.TradeType.SELL
                
                # Parse datetime fields
                open_time = trade_data.get('open_time')
                if isinstance(open_time, str):
                    open_time = datetime.fromisoformat(open_time.replace('Z', '+00:00'))
                elif not isinstance(open_time, datetime):
                    open_time = datetime.utcnow()
                
                close_time = trade_data.get('close_time')
                if isinstance(close_time, str):
                    close_time = datetime.fromisoformat(close_time.replace('Z', '+00:00'))
                elif close_time and not isinstance(close_time, datetime):
                    close_time = None
                
                # Helper: unlike dict.get(default), this also falls back
                # when the key is present but explicitly None, which is
                # what MT5 payloads commonly send for empty numeric fields.
                def _num(value, fallback):
                    return float(value) if value is not None else fallback

                if existing_trade:
                    # Update existing trade
                    existing_trade.symbol = trade_data.get('symbol') or existing_trade.symbol
                    existing_trade.type = trade_type
                    existing_trade.profit = _num(trade_data.get('profit'), existing_trade.profit)
                    existing_trade.volume = _num(trade_data.get('volume'), existing_trade.volume)
                    existing_trade.open_price = _num(trade_data.get('open_price'), existing_trade.open_price or 0)
                    existing_trade.close_price = _num(trade_data.get('close_price'), existing_trade.close_price or 0)
                    existing_trade.stop_loss = _num(trade_data.get('stop_loss'), existing_trade.stop_loss)
                    existing_trade.take_profit = _num(trade_data.get('take_profit'), existing_trade.take_profit)
                    existing_trade.commission = _num(trade_data.get('commission'), existing_trade.commission or 0)
                    existing_trade.swap = _num(trade_data.get('swap'), existing_trade.swap or 0)
                    existing_trade.open_time = open_time
                    existing_trade.close_time = close_time
                    existing_trade.updated_at = datetime.utcnow()
                    updated_count += 1
                else:
                    # Create new trade
                    new_trade = models.Trade(
                        ticket=ticket,
                        symbol=trade_data.get('symbol') or '',
                        type=trade_type,
                        open_time=open_time,
                        close_time=close_time,
                        profit=_num(trade_data.get('profit'), 0.0),
                        volume=_num(trade_data.get('volume'), 0.0),
                        open_price=_num(trade_data.get('open_price'), 0.0),
                        close_price=_num(trade_data.get('close_price'), 0.0),
                        stop_loss=_num(trade_data.get('stop_loss'), None),
                        take_profit=_num(trade_data.get('take_profit'), None),
                        commission=_num(trade_data.get('commission'), 0.0),
                        swap=_num(trade_data.get('swap'), 0.0),
                        user_id=user_id
                    )
                    db.add(new_trade)
                    new_count += 1
                
                imported_count += 1
                
            except Exception as e:
                logger.error(f"Error processing trade: {str(e)}")
                skipped_count += 1
                errors.append(f"Trade processing error: {str(e)}")
                continue
        
        db.commit()
        
        return {
            "success": True,
            "imported": imported_count,
            "new": new_count,
            "updated": updated_count,
            "skipped": skipped_count,
            "total_trades": db.query(models.Trade).filter(models.Trade.user_id == user_id).count(),
            "errors": errors if errors else None
        }
        
    except Exception as e:
        logger.error(f"Error in bulk import: {str(e)}")
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "imported": 0,
            "new": 0,
            "updated": 0,
            "skipped": 0
        }
