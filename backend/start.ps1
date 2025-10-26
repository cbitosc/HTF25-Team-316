# Educational Dashboard Backend Startup Script (PowerShell)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Educational Dashboard Backend" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python version:" -ForegroundColor Green
    Write-Host $pythonVersion
    Write-Host ""
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.9 or higher" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "app\main.py")) {
    Write-Host "ERROR: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "Current directory: $PWD" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "Activating virtual environment..." -ForegroundColor Green
    & "venv\Scripts\Activate.ps1"
    Write-Host ""
} else {
    Write-Host "WARNING: No virtual environment found" -ForegroundColor Yellow
    Write-Host "Consider creating one: python -m venv venv" -ForegroundColor Yellow
    Write-Host ""
}

# Check if dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Cyan
try {
    python -c "import fastapi" 2>&1 | Out-Null
    Write-Host "Dependencies OK" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Dependencies not installed. Installing now..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Dependencies installed successfully" -ForegroundColor Green
}
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please configure your environment:" -ForegroundColor Yellow
    Write-Host "1. Copy .env.example to .env" -ForegroundColor White
    Write-Host "2. Fill in your Firebase and MongoDB credentials" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Configuration found" -ForegroundColor Green
Write-Host ""

# Run verification script
Write-Host "Running setup verification..." -ForegroundColor Cyan
python verify_setup.py
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "WARNING: Setup verification found issues" -ForegroundColor Yellow
    Write-Host "Please fix them before starting the server" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Starting FastAPI Server" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API will be available at:" -ForegroundColor Green
Write-Host "  - API: http://localhost:8000" -ForegroundColor White
Write-Host "  - Docs: http://localhost:8000/api/docs" -ForegroundColor White
Write-Host "  - Health: http://localhost:8000/health" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
