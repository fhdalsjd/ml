from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel, EmailStr
import logging
import uvicorn

from contextlib import asynccontextmanager

from database import get_db, init_db, get_settings
from auth import (
    Token, UserCreate, UserLogin, UserResponse,
    authenticate_user, create_access_token, get_password_hash,
    get_current_user, generate_api_key
)
import models
from trade_import import import_trades_bulk
from stats import (
    TradeStats, PeriodStats,
    calculate_trade_statistics,
    get_daily_performance,
    get_weekly_performance,
    get_monthly_performance
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup (replaces deprecated @app.on_event)"""
    logger.info("Starting application...")
    init_db()
    logger.info("Database initialized")
    yield


# Initialize FastAPI app
app = FastAPI(
    title="Forex Trading Journal API",
    description="Professional trading journal with external MT5 sync and analytics",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.allowed_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for requests/responses
class TradeCreate(BaseModel):
    ticket: str
    symbol: str
    type: models.TradeType
    open_time: datetime
    close_time: Optional[datetime] = None
    profit: float
    volume: float
    open_price: Optional[float] = None
    close_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    commission: Optional[float] = 0.0
    swap: Optional[float] = 0.0
    emotion: Optional[str] = None
    mistake: Optional[str] = None
    strategy: Optional[str] = None
    notes: Optional[str] = None


class TradeUpdate(BaseModel):
    emotion: Optional[str] = None
    mistake: Optional[str] = None
    strategy: Optional[str] = None
    notes: Optional[str] = None


class TradeResponse(BaseModel):
    id: int
    ticket: str
    symbol: str
    type: models.TradeType
    open_time: datetime
    close_time: Optional[datetime]
    profit: float
    volume: float
    open_price: Optional[float]
    close_price: Optional[float]
    stop_loss: Optional[float]
    take_profit: Optional[float]
    commission: Optional[float]
    swap: Optional[float]
    emotion: Optional[str]
    mistake: Optional[str]
    strategy: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BulkTradeImport(BaseModel):
    user_id: int
    trades: List[dict]


class BulkImportResponse(BaseModel):
    success: bool
    imported: int
    new: int
    updated: int
    skipped: int
    total_trades: Optional[int] = None
    errors: Optional[List[str]] = None
    error: Optional[str] = None


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


# Authentication endpoints
@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(models.User).filter(
        (models.User.email == user_data.email) | (models.User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        api_key=generate_api_key()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"New user registered: {new_user.email}")
    return new_user


@app.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    user = authenticate_user(db, user_data.email, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    logger.info(f"User logged in: {user.email}")
    
    return {"access_token": access_token, "token_type": "bearer"}


# User endpoints
@app.get("/api/user/me", response_model=UserResponse)
async def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@app.post("/api/user/me/api-key", response_model=UserResponse)
async def regenerate_api_key(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate the current user's bulk-import API key (invalidates the old one)"""
    current_user.api_key = generate_api_key()
    db.commit()
    db.refresh(current_user)
    logger.info(f"API key regenerated for {current_user.email}")
    return current_user


# Trade endpoints
@app.get("/api/trades", response_model=List[TradeResponse])
async def get_trades(
    skip: int = 0,
    limit: int = 100,
    symbol: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's trades with optional filters"""
    query = db.query(models.Trade).filter(models.Trade.user_id == current_user.id)
    
    if symbol:
        query = query.filter(models.Trade.symbol == symbol)
    
    trades = query.order_by(models.Trade.close_time.desc()).offset(skip).limit(limit).all()
    return trades


@app.post("/api/trades", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(
    trade_data: TradeCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new trade manually"""
    # Check if trade with ticket already exists
    existing_trade = db.query(models.Trade).filter(
        models.Trade.ticket == trade_data.ticket,
        models.Trade.user_id == current_user.id
    ).first()
    
    if existing_trade:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trade with this ticket already exists"
        )
    
    new_trade = models.Trade(
        **trade_data.model_dump(),
        user_id=current_user.id
    )
    
    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)
    
    logger.info(f"New trade created: {new_trade.ticket} by {current_user.email}")
    return new_trade


@app.get("/api/trades/{trade_id}", response_model=TradeResponse)
async def get_trade(
    trade_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific trade"""
    trade = db.query(models.Trade).filter(
        models.Trade.id == trade_id,
        models.Trade.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    return trade


@app.patch("/api/trades/{trade_id}", response_model=TradeResponse)
async def update_trade(
    trade_id: int,
    trade_update: TradeUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update trade annotations (emotion, mistake, strategy, notes)"""
    trade = db.query(models.Trade).filter(
        models.Trade.id == trade_id,
        models.Trade.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    # Update only provided fields
    for field, value in trade_update.model_dump(exclude_unset=True).items():
        setattr(trade, field, value)
    
    trade.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(trade)
    
    logger.info(f"Trade updated: {trade.ticket} by {current_user.email}")
    return trade


@app.delete("/api/trades/{trade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trade(
    trade_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a trade"""
    trade = db.query(models.Trade).filter(
        models.Trade.id == trade_id,
        models.Trade.user_id == current_user.id
    ).first()
    
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    db.delete(trade)
    db.commit()
    
    logger.info(f"Trade deleted: {trade.ticket} by {current_user.email}")
    return None


# Bulk Trade Import endpoint (External MT5 client)
@app.post("/api/trades/bulk", response_model=BulkImportResponse)
async def bulk_import_trades(
    import_data: BulkTradeImport,
    db: Session = Depends(get_db),
    x_api_key: str = Header(...)
):
    """
    Bulk import trades from external MT5 client
    Requires X-API-Key header matching the target user's OWN api_key.

    SECURITY: previously this only checked a single shared secret
    (settings.api_key), so anyone holding that one key could pass any
    user_id and write trades into a different user's account. Each user
    now has a unique api_key (see /api/user/me/api-key), and the header
    must match the specific user_id being written to.
    """
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == import_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {import_data.user_id} not found"
        )

    if not user.api_key or x_api_key != user.api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key for this user"
        )

    logger.info(f"Bulk import triggered for user {user.email} with {len(import_data.trades)} trades")
    result = import_trades_bulk(import_data.trades, import_data.user_id, db)
    
    return result


# Statistics endpoints
@app.get("/api/stats", response_model=TradeStats)
async def get_statistics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive trade statistics"""
    stats = calculate_trade_statistics(db, current_user.id, start_date, end_date)
    return stats


@app.get("/api/stats/daily", response_model=List[PeriodStats])
async def get_daily_stats(
    days: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily performance statistics"""
    return get_daily_performance(db, current_user.id, days)


@app.get("/api/stats/weekly", response_model=List[PeriodStats])
async def get_weekly_stats(
    weeks: int = 12,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly performance statistics"""
    return get_weekly_performance(db, current_user.id, weeks)


@app.get("/api/stats/monthly", response_model=List[PeriodStats])
async def get_monthly_stats(
    months: int = 12,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get monthly performance statistics"""
    return get_monthly_performance(db, current_user.id, months)


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
