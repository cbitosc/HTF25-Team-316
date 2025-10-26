@echo off
REM Educational Dashboard Backend Startup Script

echo ====================================
echo Educational Dashboard Backend
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9 or higher
    pause
    exit /b 1
)

echo Python version:
python --version
echo.

REM Check if we're in the right directory
if not exist "app\main.py" (
    echo ERROR: Please run this script from the backend directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Check if virtual environment exists
if exist "venv" (
    echo Activating virtual environment...
    call venv\Scripts\activate
    echo.
) else (
    echo WARNING: No virtual environment found
    echo Consider creating one: python -m venv venv
    echo.
)

REM Check if dependencies are installed
echo Checking dependencies...
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo.
    echo Dependencies not installed. Installing now...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)
echo Dependencies OK
echo.

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found
    echo.
    echo Please configure your environment:
    echo 1. Copy .env.example to .env
    echo 2. Fill in your Firebase and MongoDB credentials
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Configuration found
echo.

REM Run verification script
echo Running setup verification...
python verify_setup.py
if errorlevel 1 (
    echo.
    echo WARNING: Setup verification found issues
    echo Please fix them before starting the server
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================
echo Starting FastAPI Server
echo ====================================
echo.
echo API will be available at:
echo   - API: http://localhost:8000
echo   - Docs: http://localhost:8000/api/docs
echo   - Health: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
