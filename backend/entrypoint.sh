#!/bin/bash
# Render uses $PORT env var. Default to 8000 if not set.
uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
