# JobPilot

JobPilot is a job search application with three local runtime processes:

- a React frontend built with Vite
- an Express API backend written in TypeScript
- a separate MCP-based AI server running over stdio

The current user-facing flow is centered on Google-backed job search, job-site discovery, trending keywords, and search suggestions.

## Overview

Local development uses these default endpoints:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`
- Health check: `http://localhost:5001/api/health`

Notes:

- The backend uses port `5001` because `5000` is commonly occupied by Docker or WSL on Windows.
- The AI MCP server is not an HTTP server. It runs as a separate terminal process and communicates over stdio.
- If Vite moves the frontend to another localhost port, the backend now accepts localhost dev origins dynamically.

## Requirements

- Node.js 18 or newer
- npm 8 or newer
- MongoDB for full local database-backed behavior

Optional:

- Google Custom Search credentials for Google job search routes

## Install

From the project root:

```powershell
cd server
npm install

cd ..\client
npm install
```

## Run Locally

### Windows quick start

| Option | Command | What it does |
| --- | --- | --- |
| PowerShell | `./start.ps1` | Starts backend API, AI MCP server, and frontend |
| Batch | `start.bat` | Starts backend API, AI MCP server, and frontend |

### Manual start

Open three terminals from the project root.

| Terminal | Directory | Command | Expected result |
| --- | --- | --- | --- |
| 1 | `server` | `npm run dev` | Backend API starts on port `5001` |
| 2 | `server` | `npm run mcp` | MCP AI server starts and stays running on stdio |
| 3 | `client` | `npm run start` | Vite starts and prints the active frontend URL |

If `5173` is already in use, Vite will automatically choose the next free port.

For a focused startup guide, see [MANUAL_START.md](MANUAL_START.md).

## Verify The App

Check the backend health endpoint:

```powershell
Invoke-RestMethod http://localhost:5001/api/health
```

Then open the frontend URL printed by Vite.

When everything is working:

- the backend terminal stays running on port `5001`
- the MCP terminal stays running and reports that it is ready on stdio
- the frontend terminal prints the active localhost port

## Active API Usage

The frontend currently relies on these backend routes:

- `GET /api/google-jobs/search`
- `GET /api/job-search/trending`
- `GET /api/job-search/categories`
- `GET /api/job-search/suggest`
- `GET /api/job-sites`
- `GET /api/job-sites/stats`
- `POST /api/contact`
- `GET /api/health`

There are additional AI-oriented and scraping routes in the codebase, but the main UI currently uses the Google-search-based flow and metadata endpoints above.

## Environment Notes

Local development expects:

- backend config in `server/.env`
- frontend config in `client/.env`

Important local values:

- `PORT=5001`
- `VITE_API_URL=http://localhost:5001/api`

## Troubleshooting

### Server Offline banner in the browser

Check these in order:

1. Confirm the backend is running at `http://localhost:5001/api/health`.
2. Confirm the frontend is using the exact localhost port printed by Vite.
3. Hard refresh the browser tab if it may still be using an older frontend bundle.
4. Confirm `client/.env` points to `http://localhost:5001/api`.

### Frontend opened on a different port

This is normal when `5173` is already occupied. Use the exact localhost URL printed by Vite.

### AI server questions

The AI server is the third terminal. It is not an HTTP service.

Run it with:

```powershell
cd server
npm run mcp
```

It should remain open and print that the MCP server is ready on stdio.

### Backend fails to start

Check whether another process is already using the backend port:

```powershell
netstat -ano | findstr :5001
```

If needed, stop the conflicting process or change the backend port in `server/.env` and the matching frontend API URL in `client/.env`.

### Client `npm run start` fails

Run:

```powershell
cd client
npm install
npm run start
```

### Build check

To verify the backend compiles:

```powershell
cd server
npm run build
```

## Project Layout

```text
JobPilot/
├── client/                React frontend
├── server/                Express API and MCP server
├── MANUAL_START.md        Focused local startup guide
├── start.ps1              Windows PowerShell launcher
├── start.bat              Windows batch launcher
└── README.md
```

Key entrypoints:

- `server/src/index.ts` for the HTTP API
- `server/src/mcp.ts` for the standalone MCP server
- `client/src/App.tsx` for the frontend app shell

## Current Recommendation

Use the three-terminal local workflow described above. If a single-command cross-platform starter is needed later, it should be added explicitly rather than relying on the legacy root workspace scripts.
