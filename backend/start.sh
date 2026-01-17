#!/bin/bash
# Production start script with dynamic PORT support
PORT=${PORT:-8001}
uvicorn server:app --host 0.0.0.0 --port $PORT
