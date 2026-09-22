#!/bin/bash
# Xvfb setup for Wine
Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99

# Run the python script
python3 /app/mt5_sync.py
