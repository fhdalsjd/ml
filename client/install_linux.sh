#!/bin/bash
# MT5 Sync Client - Linux Installation Script

echo "============================================"
echo "MT5 Trade History Sync Client - Linux Setup"
echo "============================================"
echo

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Install with: sudo apt install python3 python3-pip python3-venv"
    exit 1
fi

echo "[1/4] Python found"
python3 --version
echo

# Create virtual environment
echo "[2/4] Creating virtual environment..."
if [ -d "venv" ]; then
    echo "Virtual environment already exists, skipping..."
else
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        exit 1
    fi
fi
echo

# Activate virtual environment and install dependencies
echo "[3/4] Installing dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo

# Create .env file if it doesn't exist
echo "[4/4] Setting up configuration..."
if [ -f ".env" ]; then
    echo ".env file already exists, skipping..."
else
    cp .env.example .env
    echo "Created .env file from template"
    echo
    echo "IMPORTANT: Edit .env file with your MT5 credentials and API settings"
    echo "For Linux, you MUST set MT5_PATH to your terminal64.exe location"
fi
echo

# Create run script
cat > run_linux.sh << 'EOF'
#!/bin/bash
source venv/bin/activate
python3 mt5_sync_client.py
EOF
chmod +x run_linux.sh

echo "============================================"
echo "Installation Complete!"
echo "============================================"
echo
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Set MT5_PATH to your Wine MT5 terminal64.exe location"
echo "   Find it with: find ~/.wine -name 'terminal64.exe'"
echo "3. Make sure MetaTrader 5 is installed via Wine"
echo "4. Run: ./run_linux.sh"
echo
