from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
import models
from pydantic import BaseModel


class TradeStats(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    total_profit: float
    total_loss: float
    net_profit: float
    average_win: float
    average_loss: float
    largest_win: float
    largest_loss: float
    profit_factor: float
    average_trade: float
    max_consecutive_wins: int
    max_consecutive_losses: int
    max_drawdown: float
    total_volume: float


class PeriodStats(BaseModel):
    period: str
    profit: float
    trades: int
    win_rate: float


def calculate_trade_statistics(db: Session, user_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> TradeStats:
    """Calculate comprehensive trade statistics for a user"""
    
    # Base query
    query = db.query(models.Trade).filter(models.Trade.user_id == user_id)
    
    # Apply date filters if provided
    if start_date:
        query = query.filter(models.Trade.close_time >= start_date)
    if end_date:
        query = query.filter(models.Trade.close_time <= end_date)
    
    trades = query.all()
    
    if not trades:
        return TradeStats(
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            win_rate=0.0,
            total_profit=0.0,
            total_loss=0.0,
            net_profit=0.0,
            average_win=0.0,
            average_loss=0.0,
            largest_win=0.0,
            largest_loss=0.0,
            profit_factor=0.0,
            average_trade=0.0,
            max_consecutive_wins=0,
            max_consecutive_losses=0,
            max_drawdown=0.0,
            total_volume=0.0
        )
    
    # Calculate basic stats
    total_trades = len(trades)
    winning_trades = [t for t in trades if t.profit > 0]
    losing_trades = [t for t in trades if t.profit < 0]
    
    total_profit = sum(t.profit for t in winning_trades)
    total_loss = abs(sum(t.profit for t in losing_trades))
    net_profit = sum(t.profit for t in trades)
    
    win_rate = (len(winning_trades) / total_trades * 100) if total_trades > 0 else 0.0
    average_win = total_profit / len(winning_trades) if winning_trades else 0.0
    average_loss = total_loss / len(losing_trades) if losing_trades else 0.0
    
    largest_win = max((t.profit for t in winning_trades), default=0.0)
    largest_loss = min((t.profit for t in losing_trades), default=0.0)
    
    profit_factor = total_profit / total_loss if total_loss > 0 else 0.0
    average_trade = net_profit / total_trades if total_trades > 0 else 0.0
    
    # Calculate consecutive wins/losses
    max_consecutive_wins = 0
    max_consecutive_losses = 0
    current_win_streak = 0
    current_loss_streak = 0
    
    for trade in sorted(trades, key=lambda x: x.close_time or datetime.min):
        if trade.profit > 0:
            current_win_streak += 1
            current_loss_streak = 0
            max_consecutive_wins = max(max_consecutive_wins, current_win_streak)
        elif trade.profit < 0:
            current_loss_streak += 1
            current_win_streak = 0
            max_consecutive_losses = max(max_consecutive_losses, current_loss_streak)
    
    # Calculate max drawdown
    cumulative_profit = 0.0
    peak = 0.0
    max_drawdown = 0.0
    
    for trade in sorted(trades, key=lambda x: x.close_time or datetime.min):
        cumulative_profit += trade.profit
        if cumulative_profit > peak:
            peak = cumulative_profit
        drawdown = peak - cumulative_profit
        max_drawdown = max(max_drawdown, drawdown)
    
    total_volume = sum(t.volume for t in trades)
    
    return TradeStats(
        total_trades=total_trades,
        winning_trades=len(winning_trades),
        losing_trades=len(losing_trades),
        win_rate=round(win_rate, 2),
        total_profit=round(total_profit, 2),
        total_loss=round(total_loss, 2),
        net_profit=round(net_profit, 2),
        average_win=round(average_win, 2),
        average_loss=round(average_loss, 2),
        largest_win=round(largest_win, 2),
        largest_loss=round(largest_loss, 2),
        profit_factor=round(profit_factor, 2),
        average_trade=round(average_trade, 2),
        max_consecutive_wins=max_consecutive_wins,
        max_consecutive_losses=max_consecutive_losses,
        max_drawdown=round(max_drawdown, 2),
        total_volume=round(total_volume, 2)
    )


def get_daily_performance(db: Session, user_id: int, days: int = 30) -> List[PeriodStats]:
    """Get daily performance for the last N days"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    trades = db.query(models.Trade).filter(
        and_(
            models.Trade.user_id == user_id,
            models.Trade.close_time >= start_date,
            models.Trade.close_time <= end_date
        )
    ).all()
    
    # Group by date
    daily_stats = {}
    for trade in trades:
        if trade.close_time:
            date_key = trade.close_time.date().isoformat()
            if date_key not in daily_stats:
                daily_stats[date_key] = {"profit": 0.0, "trades": 0, "wins": 0}
            
            daily_stats[date_key]["profit"] += trade.profit
            daily_stats[date_key]["trades"] += 1
            if trade.profit > 0:
                daily_stats[date_key]["wins"] += 1
    
    result = []
    for date, stats in sorted(daily_stats.items()):
        win_rate = (stats["wins"] / stats["trades"] * 100) if stats["trades"] > 0 else 0.0
        result.append(PeriodStats(
            period=date,
            profit=round(stats["profit"], 2),
            trades=stats["trades"],
            win_rate=round(win_rate, 2)
        ))
    
    return result


def get_weekly_performance(db: Session, user_id: int, weeks: int = 12) -> List[PeriodStats]:
    """Get weekly performance for the last N weeks"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(weeks=weeks)
    
    trades = db.query(models.Trade).filter(
        and_(
            models.Trade.user_id == user_id,
            models.Trade.close_time >= start_date,
            models.Trade.close_time <= end_date
        )
    ).all()
    
    # Group by week
    weekly_stats = {}
    for trade in trades:
        if trade.close_time:
            week_key = f"{trade.close_time.year}-W{trade.close_time.isocalendar()[1]:02d}"
            if week_key not in weekly_stats:
                weekly_stats[week_key] = {"profit": 0.0, "trades": 0, "wins": 0}
            
            weekly_stats[week_key]["profit"] += trade.profit
            weekly_stats[week_key]["trades"] += 1
            if trade.profit > 0:
                weekly_stats[week_key]["wins"] += 1
    
    result = []
    for week, stats in sorted(weekly_stats.items()):
        win_rate = (stats["wins"] / stats["trades"] * 100) if stats["trades"] > 0 else 0.0
        result.append(PeriodStats(
            period=week,
            profit=round(stats["profit"], 2),
            trades=stats["trades"],
            win_rate=round(win_rate, 2)
        ))
    
    return result


def get_monthly_performance(db: Session, user_id: int, months: int = 12) -> List[PeriodStats]:
    """Get monthly performance for the last N months"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=months * 30)
    
    trades = db.query(models.Trade).filter(
        and_(
            models.Trade.user_id == user_id,
            models.Trade.close_time >= start_date,
            models.Trade.close_time <= end_date
        )
    ).all()
    
    # Group by month
    monthly_stats = {}
    for trade in trades:
        if trade.close_time:
            month_key = trade.close_time.strftime("%Y-%m")
            if month_key not in monthly_stats:
                monthly_stats[month_key] = {"profit": 0.0, "trades": 0, "wins": 0}
            
            monthly_stats[month_key]["profit"] += trade.profit
            monthly_stats[month_key]["trades"] += 1
            if trade.profit > 0:
                monthly_stats[month_key]["wins"] += 1
    
    result = []
    for month, stats in sorted(monthly_stats.items()):
        win_rate = (stats["wins"] / stats["trades"] * 100) if stats["trades"] > 0 else 0.0
        result.append(PeriodStats(
            period=month,
            profit=round(stats["profit"], 2),
            trades=stats["trades"],
            win_rate=round(win_rate, 2)
        ))
    
    return result
