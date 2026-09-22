#!/bin/bash
# Xvfb setup for Wine
Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99

# Run the python script
uvicorn app:app --host 0.0.0.0 --port 8000
