#!/bin/bash

# Start the FastAPI backend server
cd "$(dirname "$0")"
export PYTHONPATH="$(pwd):$PYTHONPATH"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
