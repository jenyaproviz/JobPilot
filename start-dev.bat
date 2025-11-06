@echo off
echo 🚀 Starting JobPilot Development Environment...

echo.
echo 📡 Starting Server...
start "JobPilot Server" cmd /k "cd /d "%~dp0server" && npm run dev"

echo.
echo ⏳ Waiting for server to initialize...
timeout /t 5 /nobreak

echo.
echo 🌐 Starting Client...
start "JobPilot Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ✅ Both services are starting!
echo 📡 Server: http://localhost:5000
echo 🌐 Client: http://localhost:5173 (or 5174 if 5173 is busy)
echo.
echo Press any key to continue...
pause