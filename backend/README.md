# Forex Trading Journal Backend

Professional FastAPI backend for a Forex trading journal with MT5 synchronization, JWT authentication, and comprehensive analytics.

## Features

- ✅ **FastAPI** - Modern, fast web framework
- ✅ **PostgreSQL** - Robust relational database with SQLAlchemy ORM
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **External MT5 Sync** - Bulk import endpoint for external MT5 clients
- ✅ **API Key Authentication** - Secure bulk import with API key
- ✅ **Comprehensive Statistics** - Win rate, P&L, drawdown, daily/weekly/monthly performance
- ✅ **Trade Management** - Full CRUD operations with annotations (emotion, mistake, strategy)
- ✅ **CORS Enabled** - Ready for frontend integration
- ✅ **Docker Ready** - Optimized for Render.com deployment

## Architecture Changes (v2.0)

### Removed
- ❌ MetaApi dependency (paid service)
- ❌ Internal scheduler (APScheduler)
- ❌ mt5_sync.py (replaced with trade_import.py)

### Added
- ✅ External bulk import endpoint (`POST /api/trades/bulk`)
- ✅ API key authentication for bulk imports
- ✅ Render.com deployment configuration (render.yaml)

## Project Structure

```
backend/
├── app.py              # Main FastAPI application
├── database.py         # Database configuration and settings
├── models.py           # SQLAlchemy models (User, Trade)
├── auth.py             # JWT authentication and user management
├── trade_import.py     # Bulk trade import logic
├── stats.py            # Trade statistics calculations
├── requirements.txt    # Python dependencies
├── Dockerfile          # Docker configuration
├── render.yaml         # Render.com deployment config
└── .env.example        # Environment variables template
```

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/trading_journal
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
API_KEY=your-secure-api-key-here-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important:** Generate secure random values for `SECRET_KEY` and `API_KEY` in production.

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

### 4. Render.com Deployment

1. Push your code to GitHub
2. Create a new Blueprint instance in Render
3. Point to `render.yaml` in your repository
4. Render will automatically:
   - Create a PostgreSQL database
   - Deploy the web service
   - Generate secure values for `SECRET_KEY` and `API_KEY`
5. Update `ALLOWED_ORIGINS` with your frontend URL

## API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token

### User
- `GET /api/user/me` - Get current user info

### Trades
- `GET /api/trades` - Get all trades (with pagination and filters)
- `POST /api/trades` - Create trade manually
- `GET /api/trades/{id}` - Get specific trade
- `PATCH /api/trades/{id}` - Update trade annotations
- `DELETE /api/trades/{id}` - Delete trade

### Bulk Import (External MT5 Client)
- `POST /api/trades/bulk` - Import trades in bulk (requires X-API-Key header)

**Request format:**
```json
{
  "user_id": 1,
  "trades": [
    {
      "ticket": "12345",
      "symbol": "EURUSD",
      "type": "BUY",
      "open_time": "2024-01-01T10:00:00Z",
      "close_time": "2024-01-01T12:00:00Z",
      "profit": 25.50,
      "volume": 0.1,
      "open_price": 1.1000,
      "close_price": 1.1050,
      "commission": -2.00,
      "swap": -0.50,
      "stop_loss": 1.0950,
      "take_profit": 1.1100
    }
  ]
}
```

**Example with curl:**
```bash
curl -X POST https://your-api.onrender.com/api/trades/bulk \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secure-api-key" \
  -d @trades.json
```

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

## External MT5 Client Integration

To sync trades from MT5 to this API, your external MT5 client (EA or script) should:

1. **Collect closed trades** from MT5 account
2. **Format trades** according to the bulk import schema
3. **Send POST request** to `/api/trades/bulk` with:
   - Header: `X-API-Key: <your-api-key>`
   - Header: `Content-Type: application/json`
   - Body: JSON with `user_id` and `trades` array

The endpoint will:
- Create new trades that don't exist
- Update existing trades (matched by ticket number)
- Skip invalid trades and report errors
- Return detailed import statistics

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- SQL injection protection via SQLAlchemy ORM
- CORS configured for specific origins
- Environment variables for sensitive data
- Non-root Docker user

## Production Considerations

1. **Generate secure keys** - Use cryptographically secure random values for `SECRET_KEY` and `API_KEY`
2. **Encrypt MT5 passwords** - Use Fernet or similar encryption if storing MT5 credentials
3. **Add rate limiting** - Implement per-endpoint rate limits
4. **Add logging** - Use structured logging (JSON format)
5. **Database migrations** - Use Alembic for schema changes
6. **Monitor endpoints** - Set up uptime monitoring
7. **API documentation** - Available at `/docs` (Swagger UI)

## Migration from v1.0

If migrating from the MetaApi version:

1. Remove environment variable `METAAPI_TOKEN`
2. Add environment variable `API_KEY`
3. Set up external MT5 client to sync trades
4. Existing trades in database will remain intact
5. Update frontend to remove any scheduler-related UI

## License

MIT
