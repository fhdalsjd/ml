@echo off
REM MT5 Sync Client - Windows Installation Script

echo ============================================
echo MT5 Trade History Sync Client - Windows Setup
echo ============================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [1/4] Python found
python --version
echo.

REM Create virtual environment
echo [2/4] Creating virtual environment...
if exist venv (
    echo Virtual environment already exists, skipping...
) else (
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)
echo.

REM Activate virtual environment and install dependencies
echo [3/4] Installing dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

REM Create .env file if it doesn't exist
echo [4/4] Setting up configuration...
if exist .env (
    echo .env file already exists, skipping...
) else (
    copy .env.example .env
    echo Created .env file from template
    echo.
    echo IMPORTANT: Edit .env file with your MT5 credentials and API settings
)
echo.

REM Create run script
echo @echo off > run_windows.bat
echo call venv\Scripts\activate.bat >> run_windows.bat
echo python mt5_sync_client.py >> run_windows.bat
echo pause >> run_windows.bat

echo ============================================
echo Installation Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Edit .env file with your credentials
echo 2. Make sure MetaTrader 5 is installed and running
echo 3. Run: run_windows.bat
echo.
pause
