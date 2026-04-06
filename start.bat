@echo off
echo ================================
echo    JobPilot Quick Start
echo ================================
echo.

echo Starting JobPilot Backend Server...
cd server
start "JobPilot Server" powershell -NoExit -Command "npm run dev"

echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo Starting JobPilot AI MCP Server...
start "JobPilot AI MCP" powershell -NoExit -Command "npm run mcp"

echo Waiting for AI server to start...
timeout /t 2 /nobreak > nul

echo Starting JobPilot Frontend Client...
cd ..\client
start "JobPilot Client" powershell -NoExit -Command "npm run start"

echo.
echo ================================
echo JobPilot is starting up!
echo ================================
echo Backend API: http://localhost:5001
echo AI MCP Server: npm run mcp in the server folder
echo Frontend Client: http://localhost:5173
echo Health Check: http://localhost:5001/api/health
echo.
echo If 5173 is busy, Vite will use the next free port.
echo If the page still shows Server Offline, hard refresh the browser.
echo.
echo Close the PowerShell windows to stop the servers.
pause