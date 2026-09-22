# Forex Trading Journal Backend

Professional FastAPI backend for a Forex trading journal with MT5 synchronization, JWT authentication, and comprehensive analytics.

## Features

- ✅ **FastAPI** - Modern, fast web framework
- ✅ **PostgreSQL** - Robust relational database with SQLAlchemy ORM
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **MetaApi Integration** - Automatic MT5 trade synchronization (supports investor passwords)
- ✅ **Background Scheduler** - Auto-sync every 5 minutes using APScheduler
- ✅ **Comprehensive Statistics** - Win rate, P&L, drawdown, daily/weekly/monthly performance
- ✅ **Trade Management** - Full CRUD operations with annotations (emotion, mistake, strategy)
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **Docker Ready** - Optimized for Railway deployment

## Project Structure

```
backend/
├── app.py              # Main FastAPI application
├── database.py         # Database configuration and settings
├── models.py           # SQLAlchemy models (User, Trade)
├── auth.py             # JWT authentication and user management
├── mt5_sync.py         # MetaApi integration for MT5 sync
├── stats.py            # Trade statistics calculations
├── scheduler.py        # Background job scheduler
├── requirements.txt    # Python dependencies
├── Dockerfile          # Docker configuration
├── railway.json        # Railway deployment config
└── .env.example        # Environment variables template
```

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/trading_journal
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
METAAPI_TOKEN=your-metaapi-token
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 3. Docker

```bash
# Build image
docker build -t trading-journal-backend .

# Run container
docker run -p 8000:8000 --env-file .env trading-journal-backend
```

### 4. Railway Deployment

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add PostgreSQL: `railway add --database postgresql`
5. Set environment variables in Railway dashboard
6. Deploy: `railway up`

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token

### User
- `GET /api/user/me` - Get current user info
- `POST /api/user/mt5-config` - Configure MT5 account

### Trades
- `GET /api/trades` - Get all trades (with pagination and filters)
- `POST /api/trades` - Create trade manually
- `GET /api/trades/{id}` - Get specific trade
- `PATCH /api/trades/{id}` - Update trade annotations
- `DELETE /api/trades/{id}` - Delete trade

### MT5 Sync
- `POST /api/sync-mt5` - Manually trigger MT5 sync

### Statistics
- `GET /api/stats` - Get comprehensive statistics
- `GET /api/stats/daily` - Get daily performance
- `GET /api/stats/weekly` - Get weekly performance
- `GET /api/stats/monthly` - Get monthly performance

### Health
- `GET /health` - Health check endpoint

## Database Models

### User
- id, email, username, hashed_password
- mt5_account_id, mt5_password (investor password)
- created_at

### Trade
- id, ticket, symbol, type (BUY/SELL)
- open_time, close_time, profit, volume
- open_price, close_price, stop_loss, take_profit
- commission, swap
- emotion, mistake, strategy, notes (user annotations)
- user_id (foreign key)
- created_at, updated_at

## Statistics Included

- Total trades, winning trades, losing trades
- Win rate percentage
- Total profit, total loss, net profit
- Average win, average loss
- Largest win, largest loss
- Profit factor
- Average trade
- Max consecutive wins/losses
- Maximum drawdown
- Total volume
- Daily/weekly/monthly performance breakdowns

## Background Jobs

The scheduler runs automatically on startup and syncs all MT5 accounts every 5 minutes.

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- SQL injection protection via SQLAlchemy ORM
- CORS configured for specific origins
- Environment variables for sensitive data
- Non-root Docker user

## Production Considerations

1. **Encrypt MT5 passwords** - Use Fernet or similar encryption
2. **Add rate limiting** - Implement per-endpoint rate limits
3. **Add logging** - Use structured logging (JSON format)
4. **Monitor background jobs** - Add job failure notifications
5. **Database migrations** - Use Alembic for schema changes
6. **API documentation** - Available at `/docs` (Swagger UI)

## License

MIT
