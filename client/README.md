# MT5 Trade History Sync Client

Standalone client that connects to MetaTrader5 and syncs deal history to your backend API every 5 minutes.

## Features

- ✅ Connects to MT5 using login credentials (supports investor password)
- ✅ Fetches deal history (configurable days back, default 30)
- ✅ Sends trades to backend via POST /api/trades/bulk
- ✅ API key authentication (X-API-Key header)
- ✅ Runs continuously with 5-minute intervals
- ✅ Comprehensive error handling and logging
- ✅ Cross-platform (Windows native, Linux with Wine)
- ✅ Configuration via .env file
- ✅ Backend handles duplicate detection by ticket

## Requirements

- **Windows**: MetaTrader5 terminal installed
- **Linux**: MetaTrader5 terminal installed via Wine
- Python 3.8 or higher

## Quick Start

### Windows

1. **Install**:
   ```cmd
   install_windows.bat
   ```

2. **Configure**:
   - Copy `.env.example` to `.env`
   - Edit `.env` with your MT5 credentials and API settings

3. **Run**:
   ```cmd
   run_windows.bat
   ```

### Linux

1. **Install**:
   ```bash
   chmod +x install_linux.sh
   ./install_linux.sh
   ```

2. **Configure**:
   - Copy `.env.example` to `.env`
   - Edit `.env` with your MT5 credentials, API settings, and MT5_PATH

3. **Run**:
   ```bash
   chmod +x run_linux.sh
   ./run_linux.sh
   ```

## Configuration

Edit the `.env` file with your settings:

```env
# MT5 Connection Settings
MT5_LOGIN=12345678
MT5_PASSWORD=your_password_here
MT5_SERVER=YourBroker-Demo

# Optional: MT5 Terminal path (required for Linux/Wine)
MT5_PATH=

# Backend API Settings
API_URL=https://your-app.onrender.com
API_KEY=your_api_key_here

# Sync Configuration
SYNC_INTERVAL_MINUTES=5
HISTORY_DAYS=30
```

### Configuration Options

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MT5_LOGIN` | MT5 account number | Yes | - |
| `MT5_PASSWORD` | MT5 password (investor password supported) | Yes | - |
| `MT5_SERVER` | MT5 server name | Yes | - |
| `MT5_PATH` | Path to terminal64.exe (Linux only) | Linux only | - |
| `API_URL` | Backend API base URL | Yes | - |
| `API_KEY` | API key for authentication | Yes | - |
| `SYNC_INTERVAL_MINUTES` | Minutes between syncs | No | 5 |
| `HISTORY_DAYS` | Days of history to fetch | No | 30 |

## Linux/Wine Setup

### Installing MT5 on Linux

1. **Install Wine**:
   ```bash
   sudo apt update
   sudo apt install wine64 winetricks
   ```

2. **Download MT5**:
   - Download the MT5 installer from your broker
   - Run with Wine: `wine mt5setup.exe`

3. **Find MT5 Path**:
   ```bash
   find ~/.wine -name "terminal64.exe"
   ```

4. **Set MT5_PATH** in `.env`:
   ```env
   MT5_PATH=/home/youruser/.wine/drive_c/Program Files/MetaTrader 5/terminal64.exe
   ```

## API Endpoint

The client sends POST requests to:
```
POST {API_URL}/api/trades/bulk
```

### Request Headers
```
X-API-Key: your_api_key_here
Content-Type: application/json
```

### Request Body
```json
{
  "trades": [
    {
      "ticket": 123456,
      "order": 123455,
      "time": 1704067200,
      "time_msc": 1704067200000,
      "type": 0,
      "entry": 0,
      "magic": 0,
      "position_id": 123456,
      "reason": 0,
      "volume": 0.01,
      "price": 1.10500,
      "commission": -0.70,
      "swap": 0.0,
      "profit": 10.50,
      "fee": 0.0,
      "symbol": "EURUSD",
      "comment": "",
      "external_id": ""
    }
  ],
  "account": 12345678,
  "server": "YourBroker-Demo"
}
```

## Logging

Logs are written to:
- Console (stdout)
- `mt5_sync.log` file in the same directory

Log format:
```
2024-01-01 12:00:00 - INFO - Connected to MT5 account: 12345678 (YourBroker-Demo)
2024-01-01 12:00:01 - INFO - Fetched 150 deals from MT5
2024-01-01 12:00:02 - INFO - Sending 150 deals to https://your-app.onrender.com/api/trades/bulk
2024-01-01 12:00:03 - INFO - Successfully sent deals to backend
2024-01-01 12:00:03 - INFO - Sync completed successfully at 2024-01-01 12:00:03
```

## Troubleshooting

### Connection Issues

**Problem**: `MT5 initialize() failed`
- **Windows**: Ensure MT5 terminal is running
- **Linux**: Check MT5_PATH is correct and points to terminal64.exe

**Problem**: `MT5 login failed`
- Verify MT5_LOGIN, MT5_PASSWORD, and MT5_SERVER are correct
- Check if your account is active
- Investor password should work for read-only access

### API Issues

**Problem**: `Failed to send deals to backend`
- Check API_URL is correct and accessible
- Verify API_KEY is valid
- Check backend logs for errors
- Ensure backend endpoint `/api/trades/bulk` exists

### Linux/Wine Issues

**Problem**: Wine crashes or MT5 doesn't start
```bash
# Reinstall Wine dependencies
winetricks dotnet48
winetricks vcrun2019

# Try 32-bit Wine if 64-bit fails
export WINEARCH=win32
```

## Running as a Service

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At system startup
4. Action: Start a program
5. Program: `pythonw.exe`
6. Arguments: `C:\path\to\mt5_sync_client.py`
7. Start in: `C:\path\to\ml\client\`

### Linux (systemd)

Create `/etc/systemd/system/mt5-sync.service`:

```ini
[Unit]
Description=MT5 Trade History Sync Client
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/ml/client
ExecStart=/usr/bin/python3 /path/to/ml/client/mt5_sync_client.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable mt5-sync.service
sudo systemctl start mt5-sync.service
sudo systemctl status mt5-sync.service
```

## Development

### Manual Testing

Run a single sync without continuous mode:
```python
from mt5_sync_client import MT5SyncClient

client = MT5SyncClient()
if client.connect_mt5():
    client.sync_once()
    client.disconnect_mt5()
```

### Custom Config File

Pass a custom config file path:
```bash
python mt5_sync_client.py /path/to/custom.env
```

## Security Notes

- ✅ `.env` file contains sensitive credentials - **never commit to git**
- ✅ Investor password recommended for read-only access
- ✅ API_KEY should be kept secret
- ✅ Backend should validate and deduplicate trades
- ✅ Use HTTPS for API_URL in production

## Support

For issues or questions:
1. Check the logs in `mt5_sync.log`
2. Verify all configuration settings
3. Test MT5 connection manually
4. Check backend API is accessible

## License

MIT License - Free to use and modify
