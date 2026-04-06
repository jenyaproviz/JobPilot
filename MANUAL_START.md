# JobPilot Manual Start

This project runs as three separate local processes:

- Frontend: Vite React app
- Backend: Express TypeScript server
- AI server: MCP stdio server

## Local Ports

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`
- Health check: `http://localhost:5001/api/health`

`5001` is used for the backend because `5000` is commonly occupied by Docker/WSL on Windows.

## One-Time Setup

From the project root:

```powershell
cd server
npm install

cd ..\client
npm install
```

## Manual Start

Open three terminals.

| Terminal | Directory | Command | Expected result |
| --- | --- | --- | --- |
| 1 | `server` | `npm run dev` | Backend API starts on port `5001` |
| 2 | `server` | `npm run mcp` | MCP AI server starts and stays running on stdio |
| 3 | `client` | `npm run start` | Vite starts and prints the active frontend URL |

The MCP server is a separate stdio-based AI process. It should not be embedded inside the HTTP API server.

If `5173` is busy, Vite will automatically move to `5174` or another free port.

## Quick Start Scripts

| Option | Command | What it does |
| --- | --- | --- |
| PowerShell | `./start.ps1` | Starts backend API, AI MCP server, and frontend |
| Batch | `start.bat` | Starts backend API, AI MCP server, and frontend |

## Verify It Is Running

Backend health:

```powershell
Invoke-RestMethod http://localhost:5001/api/health
```

Frontend:

- Open `http://localhost:5173`
- If that page shows old cached code, do a hard refresh

AI MCP server:

- The MCP terminal should stay running
- It does not expose an HTTP port; it communicates over stdio

## Common Problems

### Server Offline banner in browser

Causes:

- backend not started
- AI MCP server not started for full AI tooling support
- browser still running an older frontend bundle that points to port `5000`

Fix:

1. Make sure `npm run dev` is running in `server`
2. Make sure `npm run mcp` is running in `server`
3. Make sure `npm run start` or `npm run dev` is running in `client`
4. Hard refresh the browser tab
5. Confirm `http://localhost:5001/api/health` responds

### `npm run start` fails in `client`

The client now includes a `start` script that runs Vite. If it still fails, run:

```powershell
cd client
npm install
npm run start
```

### Port 5173 already in use

This is not fatal. Vite will choose another free port and print it in the terminal.
