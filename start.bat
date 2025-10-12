@echo off
echo ================================
echo    JobPilot Quick Start
echo ================================
echo.

echo Starting JobPilot Backend Server...
cd server
start "JobPilot Server" powershell -NoExit -Command "npm start"

echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo Starting JobPilot Frontend Client...
cd ..\client
start "JobPilot Client" powershell -NoExit -Command "npm run dev"

echo.
echo ================================
echo JobPilot is starting up!
echo ================================
echo Backend Server: http://localhost:5000
echo Frontend Client: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause > nul

start http://localhost:5173

echo.
echo JobPilot is now running!
echo Close the PowerShell windows to stop the servers.
pause