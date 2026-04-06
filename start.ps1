# JobPilot Quick Start Script
# PowerShell script to start both backend and frontend

Write-Host "================================" -ForegroundColor Cyan
Write-Host "    JobPilot Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverPath = Join-Path $scriptPath "server"
$clientPath = Join-Path $scriptPath "client"

if (-not (Test-Path $serverPath)) {
    Write-Host "Server directory not found: $serverPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $clientPath)) {
    Write-Host "Client directory not found: $clientPath" -ForegroundColor Red
    exit 1
}

Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; npm run dev" -WindowStyle Normal | Out-Null

Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting AI MCP server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverPath'; npm run mcp" -WindowStyle Normal | Out-Null

Write-Host "Waiting for AI MCP server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "Starting frontend client..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientPath'; npm run start" -WindowStyle Normal | Out-Null

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "JobPilot is starting" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5001" -ForegroundColor White
Write-Host "AI MCP Server: server stdio process via 'npm run mcp'" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Health: http://localhost:5001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "If 5173 is busy, Vite will move to the next free port." -ForegroundColor Yellow
Write-Host "If the page still shows Server Offline, hard refresh the browser." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this launcher..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")