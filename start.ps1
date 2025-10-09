# JobPilot Quick Start Script
# PowerShell script to start both backend and frontend

Write-Host "================================" -ForegroundColor Cyan
Write-Host "    JobPilot Quick Start" -ForegroundColor Cyan  
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverPath = Join-Path $scriptPath "server"
$clientPath = Join-Path $scriptPath "client"

# Check if directories exist
if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Server directory not found: $serverPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $clientPath)) {
    Write-Host "❌ Client directory not found: $clientPath" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting JobPilot Backend Server..." -ForegroundColor Green
$serverProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; Write-Host 'JobPilot Server Starting...' -ForegroundColor Green; node google-job-server.js" -PassThru

Write-Host "⏱️  Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "🎨 Starting JobPilot Frontend Client..." -ForegroundColor Green
$clientProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; Write-Host 'JobPilot Client Starting...' -ForegroundColor Green; npm run dev" -PassThru

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ JobPilot is starting up!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🌐 Backend Server: http://localhost:3001" -ForegroundColor White
Write-Host "🎨 Frontend Client: http://localhost:5173" -ForegroundColor White
Write-Host ""

Write-Host "⏱️  Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🌐 Opening JobPilot in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "🎉 JobPilot is now running!" -ForegroundColor Green
Write-Host "📝 Close the PowerShell windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")