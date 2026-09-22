from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging
from mt5_sync import get_mt5_syncer
from database import SessionLocal

logger = logging.getLogger(__name__)


class BackgroundScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
    
    async def sync_all_accounts_job(self):
        """Background job to sync all MT5 accounts"""
        logger.info("Starting scheduled MT5 sync for all accounts")
        db = SessionLocal()
        try:
            syncer = get_mt5_syncer()
            results = await syncer.sync_all_users(db)
            
            total_synced = sum(r.get('synced', 0) for r in results)
            total_new = sum(r.get('new', 0) for r in results)
            
            logger.info(f"Scheduled sync completed: {len(results)} users, {total_synced} trades synced, {total_new} new trades")
        except Exception as e:
            logger.error(f"Error in scheduled sync job: {str(e)}")
        finally:
            db.close()
    
    def start(self):
        """Start the background scheduler"""
        if not self.is_running:
            # Add job to sync every 5 minutes
            self.scheduler.add_job(
                self.sync_all_accounts_job,
                trigger=IntervalTrigger(minutes=5),
                id='sync_mt5_accounts',
                name='Sync MT5 accounts every 5 minutes',
                replace_existing=True
            )
            
            self.scheduler.start()
            self.is_running = True
            logger.info("Background scheduler started - MT5 sync every 5 minutes")
    
    def shutdown(self):
        """Shutdown the scheduler"""
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Background scheduler stopped")


# Singleton instance
_scheduler = None

def get_scheduler() -> BackgroundScheduler:
    """Get or create scheduler singleton"""
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler()
    return _scheduler
