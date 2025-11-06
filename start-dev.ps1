#!/usr/bin/env powershell

Write-Host "🚀 Starting JobPilot Application..." -ForegroundColor Green

# Start Server in background
Write-Host "📡 Starting Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\jenka\Documents\Projects fullstack\JobPilot\server'; npm run dev" -WindowStyle Normal

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Start Client in background  
Write-Host "🌐 Starting Client..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\jenka\Documents\Projects fullstack\JobPilot\client'; npm run dev" -WindowStyle Normal

Write-Host "✅ Both Server and Client are starting..." -ForegroundColor Green
Write-Host "🌐 Client: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📡 Server: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press any key to continue..." -ForegroundColor Gray
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")