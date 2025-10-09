# JobPilot - AI-Powered Job Search Engine

JobPilot is a comprehensive job search platform that combines Google-powered search capabilities with live job scraping from multiple sources. It features a modern React frontend and a powerful Express.js backend that searches real job sites to provide up-to-date job listings.

## 🚀 Features

- **Google-Powered Search**: Intelligent job search using Google Custom Search API
- **Live Job Scraping**: Real-time job data from multiple job boards:
  - RemoteOK
  - WeWorkRemotely  
  - GitHub Careers
  - StackOverflow Network
- **Modern UI**: React 19 + TypeScript frontend with Tailwind CSS
- **Real-Time Data**: Fresh job listings scraped directly from job sites
- **Global Search**: Find jobs anywhere on the internet
- **Smart Filtering**: Filter by location, experience level, employment type
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd JobPilot
```

### 2. Install Dependencies

#### Install Server Dependencies
```bash
cd server
npm install
```

#### Install Client Dependencies  
```bash
cd ../client
npm install
```

### 3. Environment Configuration (Optional)

For enhanced functionality, you can configure Google Custom Search API:

1. Create a `.env` file in the `server` directory:
```bash
cd ../server
touch .env
```

2. Add your Google API credentials to `.env`:
```
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

> **Note**: The system works without Google API keys using fallback job scraping. Google API configuration is optional but recommended for enhanced search capabilities.

## 🚀 Starting the Project

### Method 1: Quick Start Scripts (Easiest)

#### Windows Batch File
Double-click `start.bat` or run:
```bash
./start.bat
```

#### PowerShell Script
```powershell
./start.ps1
```

#### NPM Script
```bash
npm run install:all  # Install all dependencies
npm run start        # Start both server and client
```

### Method 2: Manual Start (Recommended for Development)

#### 1. Start the Backend Server
Open a terminal and navigate to the server directory:
```bash
cd server
node google-job-server.js
```

You should see:
```
🌍 Google JobPilot Server running on port 3001
📡 API Endpoints:
   - GET http://localhost:3001/api/jobs/search?q=keywords&location=location
   - GET http://localhost:3001/api/jobs/suggestions?q=partial_keywords
   - GET http://localhost:3001/api/jobs/popular
   - GET http://localhost:3001/api/jobs/stats
   - GET http://localhost:3001/health
🔍 Powered by Google Custom Search API
🌐 Global Job Search - Any job, anywhere on the internet!
```

#### 2. Start the Frontend Client
Open a **new terminal** and navigate to the client directory:
```bash
cd client
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Method 3: Using PowerShell (Windows)

#### Start Backend:
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\path\to\JobPilot\server'; node google-job-server.js"
```

#### Start Frontend:
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\path\to\JobPilot\client'; npm run dev"
```

## 🌐 Accessing the Application

1. **Frontend**: Open your browser and go to `http://localhost:5173`
2. **Backend API**: Available at `http://localhost:3001`
3. **Health Check**: `http://localhost:3001/api/health`

## 🔍 Using JobPilot

### Search for Jobs
1. Open `http://localhost:5173` in your browser
2. Enter job keywords in the search box (e.g., "React Developer", "JavaScript", "Python Engineer")
3. Optionally specify a location (e.g., "Remote", "New York", "Tel Aviv")
4. Click "Search Jobs"

### Example Searches
- `React Developer` - Find React development positions
- `Python Remote` - Python jobs with remote options
- `JavaScript Tel Aviv` - JavaScript jobs in Tel Aviv area
- `TypeScript Senior` - Senior TypeScript positions

## 📡 API Endpoints

The backend server provides several REST API endpoints:

### Job Search
```
GET /api/jobs/search?q=keywords&location=location&limit=20
```

### Health Check
```
GET /api/health
```

### Job Suggestions
```
GET /api/jobs/suggestions?q=partial_keywords
```

### Job Statistics
```
GET /api/jobs/stats
```

## 🔧 Troubleshooting

### Server Connection Issues
If you see "Server Offline" in the frontend:

1. **Check if server is running**:
   ```bash
   netstat -ano | findstr :3001
   ```

2. **Restart the server**:
   ```bash
   cd server
   node google-job-server.js
   ```

3. **Check server logs** for any error messages

### Frontend Issues
If the frontend isn't loading:

1. **Ensure client is running**:
   ```bash
   netstat -ano | findstr :5173
   ```

2. **Restart the client**:
   ```bash
   cd client
   npm run dev
   ```

### Common Issues

#### Port Already in Use
If you get "port already in use" errors:

**For Backend (port 3001):**
```bash
# Kill process on port 3001
npx kill-port 3001
# Or manually find and kill the process
netstat -ano | findstr :3001
taskkill /F /PID <process-id>
```

**For Frontend (port 5173):**
```bash
# Kill process on port 5173
npx kill-port 5173
```

#### Dependencies Issues
If you encounter dependency errors:
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🏗️ Project Structure

```
JobPilot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   └── services/       # Backend services
│   ├── google-job-server.js # Main server file
│   └── package.json
├── start.bat              # Windows batch start script
├── start.ps1              # PowerShell start script  
├── package.json           # Root package.json with scripts
└── README.md              # This file
```

## 🔮 Job Sources

JobPilot aggregates jobs from multiple sources:

1. **RemoteOK**: Remote developer positions
2. **WeWorkRemotely**: Remote job opportunities  
3. **GitHub**: Tech industry positions
4. **StackOverflow Network**: Developer-focused jobs
5. **Google Search**: Fallback search across the web

## 🚀 Development

### Adding New Job Sources
To add new job scraping sources, edit:
```
server/src/services/LiveJobScraper.js
```

### Modifying the Frontend
The React frontend is in the `client/` directory. Key files:
- `src/App.tsx` - Main application
- `src/components/JobCard.tsx` - Individual job display
- `src/services/api.ts` - API communication

### Backend Configuration
The main server configuration is in:
```
server/google-job-server.js
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure both server and client are running
3. Check browser console for error messages
4. Verify API endpoints are accessible

---

**Happy Job Hunting! 🎯**