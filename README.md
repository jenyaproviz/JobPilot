# JobPilot - AI-Powered Job Search Engine

JobPilot is a comprehensive job search platform that combines Google-powered search capabilities with live job scraping from multiple sources. It features a modern React frontend and a powerful Express.js backend with professional configuration management and intelligent search capabilities.

## 🚀 Features

### Core Functionality
- **Google-Powered Search**: Intelligent job search using Google Custom Search API with quota management
- **Advanced Pagination**: Professional pagination system with 10/25/50 results per page options
- **Live Job Scraping**: Real-time job data from multiple international job boards
- **Flexible Search**: Smart keyword matching across title, description, company, and requirements
- **AI Integration**: MCP (Model Context Protocol) server for intelligent job analysis

### Job Sources
- **RemoteOK**: Remote developer positions worldwide
- **WeWorkRemotely**: Global remote job opportunities  
- **GitHub Careers**: Tech industry positions from GitHub
- **StackOverflow Network**: Developer-focused jobs
- **Jobify360**: Israeli and international tech jobs
- **DevJobs**: Specialized developer positions
- **ZipRecruiter**: Comprehensive job listings
- **Israeli Job Sites**: AllJobs.co.il, TechIt.co.il, Drushim.co.il, ElbitSystems, JobMaster, JobNet

### Technical Features
- **Modern UI**: React 19 + TypeScript frontend with Tailwind CSS
- **Centralized Configuration**: Professional constants management system
- **Real-Time Data**: Fresh job listings scraped directly from job sites
- **Global Search**: Find jobs anywhere on the internet with API quota transparency
- **Smart Filtering**: Advanced filtering by location, experience level, employment type
- **Responsive Design**: Optimized for desktop and mobile devices
- **Professional Architecture**: Type-safe configuration with single source of truth

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

The backend server provides comprehensive REST API endpoints:

### Core Job Search
```bash
GET /api/jobs?keywords=developer&location=remote&limit=25&page=1
# Advanced search with pagination and filtering

GET /api/jobs/search?q=keywords&location=location&limit=10
# Alternative search endpoint

GET /api/jobs/google-search?keywords=react&location=newyork&limit=50
# Google-powered search with quota management
```

### Job Management
```bash
POST /api/jobs/scrape
# Trigger live job scraping from multiple sites

POST /api/jobs/scrape/intelligent  
# AI-enhanced scraping with intelligent job analysis

GET /api/jobs/:id
# Get specific job details by ID
```

### Statistics & Analytics
```bash
GET /api/jobs/stats/overview
# Comprehensive job market statistics

GET /api/jobs/suggestions?q=partial_keywords
# Smart job search suggestions

GET /api/jobs/trending
# Trending job keywords and skills
```

### System Health
```bash
GET /api/health
# Server health check and status

GET /api/jobs/test/scrape-config
# Test endpoint for scraping configuration validation
```

### Filter Options
```bash
GET /api/jobs/filters?keywords=developer&location=telaviv
# Get available filter options for search results
```

## 🆕 Recent Improvements (v2.0)

### Pagination System Overhaul
- ✅ **Centralized Constants**: Eliminated 28+ hardcoded pagination values across 14+ files
- ✅ **Professional Configuration**: Type-safe constants with single source of truth
- ✅ **Flexible Page Sizes**: Dynamic 10/25/50 results per page options
- ✅ **Smart Navigation**: Intelligent pagination with proper total pages calculation
- ✅ **API Transparency**: Clear display of Google API limitations vs. total results

### Search Engine Enhancement
- ✅ **Flexible Matching**: Upgraded from strict text search to intelligent regex-based matching
- ✅ **Multi-Field Search**: Searches across title, description, company, requirements, keywords
- ✅ **Better Results**: More relevant job matches with reduced empty result pages
- ✅ **Graceful Fallbacks**: Intelligent handling of restrictive search queries

### Job Source Expansion
- ✅ **Three New Job Sites**: Added Jobify360, DevJobs, and ZipRecruiter integration
- ✅ **Israeli Market Coverage**: Comprehensive Israeli job sites scraping
- ✅ **Featured Job Sites**: Updated main page cards with new job sources
- ✅ **Real-Time Scraping**: Live job data from 15+ sources worldwide

### Technical Architecture
- ✅ **Configuration Management**: Professional centralized constants system
- ✅ **Code Quality**: Eliminated hardcoded values for maintainable codebase
- ✅ **Type Safety**: Full TypeScript support with proper type definitions
- ✅ **Error Handling**: Robust error handling for API quota limits and scraping failures

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

#### Pagination Shows 0 Results on Page 2+
If page 2+ shows no results despite having a total count:

1. **Check Search Specificity**: Very specific searches (e.g., "strategic buyer Tel Aviv") may have limited results
2. **Try Broader Keywords**: Use general terms like "developer" or "engineer"
3. **Run Job Scraping**: Populate database with fresh jobs:
   ```bash
   curl -X POST "http://localhost:5000/api/jobs/scrape" \
   -H "Content-Type: application/json" \
   -d '{"keywords": "developer", "location": ""}'
   ```
4. **Check Database**: Verify jobs exist in MongoDB for your search criteria

#### Google API Quota Exceeded
If you see "quota exceeded" messages:

1. **Daily Limit**: Google Custom Search API has 100 queries/day limit
2. **Wait for Reset**: Quota resets at midnight PST
3. **Fallback Mode**: System automatically uses live scraping when quota exceeded
4. **Monitor Usage**: Check Google Cloud Console for quota usage

#### Port Already in Use
If you get "port already in use" errors:

**For Backend (port 5000):**
```bash
# Kill process on port 5000
npx kill-port 5000
# Or manually find and kill the process
netstat -ano | findstr :5000
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

#### TypeScript Build Errors
If you encounter TypeScript compilation errors:
```bash
# Rebuild server
cd server
npm run build

# Rebuild client
cd ../client  
npm run build
```

## 🏗️ Project Structure

```
JobPilot/
├── client/                           # React frontend
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── JobCard.tsx          # Individual job display
│   │   │   ├── JobList.tsx          # Job listings with pagination
│   │   │   ├── JobSearchForm.tsx    # Search form with trending keywords
│   │   │   ├── JobSearchResults.tsx # Search results with pagination
│   │   │   ├── Pagination.tsx       # Professional pagination component
│   │   │   └── JobSitesView.tsx     # Featured job sites cards
│   │   ├── constants/
│   │   │   └── pagination.ts        # Frontend pagination constants
│   │   ├── services/                # API services
│   │   ├── store/                   # Redux store with jobsSlice
│   │   ├── types/                   # TypeScript types
│   │   └── App.tsx                  # Main app component
│   ├── package.json
│   └── vite.config.ts
├── server/                          # Express backend
│   ├── src/
│   │   ├── constants/
│   │   │   └── pagination.ts        # Centralized backend constants
│   │   ├── services/                # Backend services
│   │   │   ├── GoogleJobSearchService.ts  # Google API integration
│   │   │   ├── IntelligentJobService.ts   # AI-powered job service
│   │   │   ├── JobService.ts        # Core job search logic
│   │   │   ├── LiveJobScraper.ts    # Live job scraping
│   │   │   ├── IsraeliJobScraper.ts # Israeli job sites scraping
│   │   │   └── MCPServer.ts         # AI capabilities server
│   │   ├── routes/                  # API routes
│   │   │   ├── jobs.ts              # Main job search endpoints
│   │   │   ├── googleJobs.ts        # Google-specific search
│   │   │   └── jobSearch.ts         # Alternative search endpoints
│   │   ├── models/                  # MongoDB models
│   │   └── config/                  # Database and scraping configs
│   ├── constants/
│   │   └── pagination.js            # CommonJS constants for JS files
│   ├── google-job-server.js         # Google-powered server
│   ├── live-server.js               # Live scraping server
│   ├── real-israeli-server.js       # Israeli job sites server
│   └── package.json
├── start.bat                        # Windows batch start script
├── start.ps1                        # PowerShell start script  
├── package.json                     # Root package.json with scripts
└── README.md                        # This file
```

## 🎯 Professional Pagination System

JobPilot features a comprehensive pagination system with centralized configuration:

### Features
- **Flexible Page Sizes**: Choose from 10, 25, or 50 results per page
- **Smart Navigation**: Intelligent page navigation with total results display
- **API Quota Management**: Transparent Google API limitations (100 results max) vs. total available results
- **Centralized Constants**: Single source of truth for all pagination settings
- **Type-Safe Configuration**: TypeScript constants ensure consistency across frontend and backend

### Configuration
All pagination settings are managed through centralized constants:

**Frontend** (`client/src/constants/pagination.ts`):
```typescript
export const PAGINATION = {
  DEFAULT_RESULTS_PER_PAGE: 10,
  RESULTS_PER_PAGE_OPTIONS: [10, 25, 50],
  MAX_API_RESULTS: 100,
  PAGE_NAVIGATION_DELTA: 2
} as const;
```

**Backend** (`server/src/constants/pagination.ts`):
```typescript
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_RESULTS_PER_PAGE: 10,
  MAX_API_RESULTS: 100,
  MAX_RESULTS_LIMIT: 200
} as const;
```

## 🔧 Enhanced Search Capabilities

### Intelligent Search Algorithm
- **Flexible Matching**: Searches across job title, description, company, requirements, and keywords
- **Regex-Based**: Uses intelligent regex patterns for better match quality
- **Fallback Logic**: Graceful degradation when strict searches return no results
- **Multi-Field Search**: Searches multiple job attributes simultaneously

### Google API Integration
- **Quota Management**: Handles daily API limits (100 queries/day) gracefully
- **Multiple Requests**: Makes up to 10 API calls for comprehensive results
- **Real Results Display**: Shows actual total results (e.g., 81,900+) vs. API limitations
- **Transparent Limitations**: Clear user communication about API constraints

## 🔮 Job Sources

JobPilot aggregates jobs from multiple sources worldwide:

### International Sources
1. **RemoteOK**: Remote developer positions globally
2. **WeWorkRemotely**: Remote job opportunities worldwide
3. **GitHub Careers**: Tech industry positions from GitHub
4. **StackOverflow Network**: Developer-focused jobs
5. **Jobify360**: International tech job opportunities
6. **DevJobs**: Specialized developer positions
7. **ZipRecruiter**: Comprehensive job listings

### Israeli Job Market
8. **AllJobs.co.il**: Israel's leading job portal
9. **TechIt.co.il**: Israeli tech job specialization
10. **Drushim.co.il**: Professional job listings
11. **ElbitSystems**: Defense industry careers
12. **JobMaster.co.il**: General job marketplace
13. **JobNet.co.il**: Professional networking jobs

### Fallback Sources
14. **Google Search**: Web-wide job search capability
15. **Live Scraping**: Real-time job data extraction

## 🚀 Development

### Configuration Management
All pagination and search settings are centralized:

**Frontend Constants** (`client/src/constants/pagination.ts`):
```typescript
export const PAGINATION = {
  DEFAULT_RESULTS_PER_PAGE: 10,
  RESULTS_PER_PAGE_OPTIONS: [10, 25, 50] as const,
  MAX_API_RESULTS: 100,
  PAGE_NAVIGATION_DELTA: 2
} as const;
```

**Backend Constants** (`server/src/constants/pagination.ts`):
```typescript
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_RESULTS_PER_PAGE: 10,
  MAX_API_RESULTS: 100,
  DEFAULT_KEYWORDS: 'developer',
  MAX_RESULTS_LIMIT: 200
} as const;

export const FILTER_LIMITS = {
  MAX_SOURCES: 20,
  MAX_LOCATIONS: 50,
  MAX_COMPANIES: 100
} as const;
```

### Adding New Job Sources
To add new job scraping sources:

1. **Live Job Scraper**: Edit `server/src/services/LiveJobScraper.ts`
2. **Israeli Jobs**: Edit `server/src/services/IsraeliJobScraper.ts`  
3. **Configuration**: Update `server/src/config/scrapingConfigs.ts`

### Modifying Pagination
To change pagination behavior:

1. **Update Constants**: Modify the centralized constants files
2. **Frontend**: Components automatically use `PAGINATION` constants
3. **Backend**: Services automatically use `PAGINATION_CONSTANTS`
4. **No Hardcoded Values**: Never use hardcoded pagination numbers

### Key Frontend Files
The React frontend is in the `client/` directory:
- `src/App.tsx` - Main application
- `src/components/JobCard.tsx` - Individual job display  
- `src/components/Pagination.tsx` - Professional pagination component
- `src/components/JobSearchResults.tsx` - Search results with pagination
- `src/store/jobsSlice.ts` - Redux state management
- `src/services/api.ts` - API communication

### Key Backend Files
The Express backend is in the `server/` directory:
- `src/services/IntelligentJobService.ts` - AI-powered job service
- `src/services/JobService.ts` - Core job search logic
- `src/services/GoogleJobSearchService.ts` - Google API integration
- `src/routes/jobs.ts` - Main job search endpoints
- `src/constants/pagination.ts` - Centralized configuration

### Database Schema
MongoDB collections:
- `jobs` - Job listings with full-text search indexes
- `scrapingconfigs` - Site-specific scraping configurations
- `users` - User profiles and preferences (future feature)

### Building and Deployment
```bash
# Build entire project
npm run build

# Build server only  
cd server && npm run build

# Build client only
cd client && npm run build

# Start production server
cd server && npm start
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