# Google Job Search Configuration

## Google Custom Search API Setup

To enable Google-powered job searching, you need to set up Google Custom Search API:

### 1. Get Google API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the "Custom Search API"
4. Go to "Credentials" and create an API Key
5. Copy your API key

### 2. Create Custom Search Engine
1. Go to [Google Custom Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" to create a new search engine
3. In "Sites to search", enter: `*` (to search the entire web)
4. Name your search engine (e.g., "JobPilot Global Job Search")
5. Click "Create"
6. Copy your Search Engine ID

### 3. Configure Environment Variables
Add these to your `.env` file:

```env
# Google Custom Search API Configuration
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 4. Optional: Enhance Search Engine
To improve job search results, you can:

1. Go back to your Custom Search Engine settings
2. Add these sites to "Sites to search" for better job results:
   - linkedin.com/jobs/*
   - indeed.com/*
   - glassdoor.com/Jobs/*
   - monster.com/*
   - careerbuilder.com/*
   - dice.com/*
   - stackoverflow.com/jobs/*
   - angel.co/jobs/*
   - remote.co/remote-jobs/*

3. Enable "Search the entire web" option
4. Turn on "Image search" if you want company logos

## Usage Limits
- Google Custom Search API: 100 free queries/day
- For higher volume: Paid plan available ($5 per 1000 queries)

## Fallback Mode
If API keys are not configured, the service will run in fallback mode with limited functionality.

## Testing Your Setup
Once configured, test with:
```javascript
const service = new GoogleJobSearchService();
const results = await service.searchJobs('javascript developer', {
  location: 'San Francisco',
  limit: 10
});
```