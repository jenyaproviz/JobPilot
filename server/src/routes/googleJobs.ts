import express from 'express';
import { Request, Response } from 'express';
import { GoogleJobSearchService } from '../services/GoogleJobSearchService';
import { PAGINATION_CONSTANTS } from '../constants/pagination';

const router = express.Router();
const googleJobSearch = new GoogleJobSearchService();

// GET /api/jobs/google-search - New Google-based job search
router.get('/google-search', async (req: Request, res: Response) => {
  try {
    const { 
      keywords = PAGINATION_CONSTANTS.DEFAULT_KEYWORDS, 
      location = PAGINATION_CONSTANTS.DEFAULT_LOCATION, 
      limit = PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE 
    } = req.query;

    console.log(`🔍 Google job search: "${keywords}" in ${location || 'any location'}`);

    const searchResult = await googleJobSearch.searchJobs(
      keywords as string, 
      location as string, 
      parseInt(limit as string)
    );

    res.json({
      success: true,
      jobs: searchResult.jobs,
      totalCount: searchResult.jobs.length,
      totalResultsAvailable: searchResult.totalResultsAvailable,
      maxResultsReturnable: searchResult.maxResultsReturnable,
      page: 1,
      totalPages: 1,
      searchParams: { keywords, location, limit: parseInt(limit as string) },
      message: `Found ${searchResult.totalResultsAvailable.toLocaleString()} total results (showing ${searchResult.jobs.length})`,
      searchType: 'google',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in Google job search:', error);
    res.status(500).json({
      success: false,
      error: 'Google job search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/jobs/search - Updated to use Google search (replaces old scraping)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { 
      q: keywords = PAGINATION_CONSTANTS.DEFAULT_KEYWORDS,
      keywords: altKeywords,
      location = PAGINATION_CONSTANTS.DEFAULT_LOCATION, 
      limit = PAGINATION_CONSTANTS.MAX_RESULTS_LIMIT,
      page = PAGINATION_CONSTANTS.DEFAULT_PAGE,
      employmentType,
      experienceLevel,
      datePosted
    } = req.query;

    const searchKeywords = (keywords || altKeywords) as string;
    const resultsLimit = parseInt(limit as string);
    const currentPage = parseInt(page as string);
    
    console.log(`🔍 Job search (Google): "${searchKeywords}" in ${location || 'any location'} - Page ${currentPage}, Limit ${resultsLimit}`);

    // Google Custom Search API limits us to 10 results per request, so we need to make multiple requests
    // For now, we'll get more results by making multiple calls with different start indices
    const maxResults = Math.min(resultsLimit, PAGINATION_CONSTANTS.MAX_API_RESULTS); // Cap at API results total
    const searchResult = await googleJobSearch.searchJobs(
      searchKeywords, 
      location as string, 
      maxResults
    );

    // Apply filters if provided
    let filteredJobs = searchResult.jobs;
    
    if (employmentType && employmentType !== 'any') {
      filteredJobs = filteredJobs.filter(job => 
        job.employmentType.toLowerCase().includes((employmentType as string).toLowerCase())
      );
    }

    if (experienceLevel && experienceLevel !== 'any') {
      filteredJobs = filteredJobs.filter(job => 
        job.experienceLevel.toLowerCase() === (experienceLevel as string).toLowerCase()
      );
    }

    // Calculate pagination based on API constraints
    const availableResults = Math.min(searchResult.maxResultsReturnable, searchResult.totalResultsAvailable);
    const totalPages = Math.ceil(availableResults / resultsLimit);
    
    // For page 1, use the results we already have
    let paginatedJobs: any[] = filteredJobs;
    
    // For page 2+, make additional API call with specific start index
    const startIndex = (currentPage - 1) * resultsLimit;
    
    if (currentPage > 1 && startIndex < availableResults) {
      console.log(`📡 Fetching page ${currentPage} results from Google API (start: ${startIndex + 1})`);
      
      try {
        // Make API call for specific page (Google API uses 1-based indexing)
        const pageResult = await googleJobSearch.searchJobs(
          searchKeywords,
          location as string,
          resultsLimit,
          startIndex + 1
        );
        
        if (pageResult && pageResult.jobs.length > 0) {
          paginatedJobs = pageResult.jobs;
          
          // Apply filters to page results
          if (employmentType && employmentType !== 'any') {
            paginatedJobs = paginatedJobs.filter(job => 
              job.employmentType.toLowerCase().includes((employmentType as string).toLowerCase())
            );
          }

          if (experienceLevel && experienceLevel !== 'any') {
            paginatedJobs = paginatedJobs.filter(job => 
              job.experienceLevel.toLowerCase() === (experienceLevel as string).toLowerCase()
            );
          }
        } else {
          paginatedJobs = []; // No results for this page
        }
      } catch (error) {
        console.error('❌ Error fetching page results:', error);
        paginatedJobs = [];
      }
    }

    res.json({
      success: true,
      jobs: paginatedJobs,
      totalCount: availableResults, // Jobs we actually have
      totalResultsAvailable: searchResult.totalResultsAvailable, // Total from Google
      maxResultsReturnable: searchResult.maxResultsReturnable, // API limitation
      currentPage: currentPage,
      totalPages: totalPages,
      resultsPerPage: resultsLimit,
      filters: { 
        keywords: searchKeywords, 
        location, 
        employmentType, 
        experienceLevel, 
        datePosted 
      },
      searchParams: { 
        keywords: searchKeywords, 
        location, 
        limit: resultsLimit,
        page: currentPage
      },
      message: `Found ${searchResult.totalResultsAvailable.toLocaleString()} total results. Showing ${paginatedJobs.length} jobs on page ${currentPage} (${availableResults} available through API)`,
      searchType: 'google',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in job search:', error);
    res.status(500).json({
      success: false,
      error: 'Job search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/jobs - Simple job search endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      query = PAGINATION_CONSTANTS.DEFAULT_KEYWORDS,
      keywords = PAGINATION_CONSTANTS.DEFAULT_KEYWORDS, 
      location = PAGINATION_CONSTANTS.DEFAULT_LOCATION, 
      limit = PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE 
    } = req.query;

    const searchKeywords = (query || keywords) as string;
    
    console.log(`🔍 Simple job search: "${searchKeywords}"`);

    const searchResult = await googleJobSearch.searchJobs(
      searchKeywords, 
      location as string, 
      parseInt(limit as string)
    );

    res.json({
      success: true,
      jobs: searchResult.jobs,
      totalCount: searchResult.jobs.length,
      totalResultsAvailable: searchResult.totalResultsAvailable,
      maxResultsReturnable: searchResult.maxResultsReturnable,
      page: 1,
      totalPages: 1,
      searchParams: { query: searchKeywords, location, limit: parseInt(limit as string) },
      message: `Found ${searchResult.totalResultsAvailable.toLocaleString()} total results (showing ${searchResult.jobs.length})`,
      searchType: 'google',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in simple job search:', error);
    res.status(500).json({
      success: false,
      error: 'Simple job search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint to check configuration
router.get('/test-config', async (req: Request, res: Response) => {
  const service = new GoogleJobSearchService();
  res.json({
    hasApiKey: !!process.env.GOOGLE_API_KEY,
    hasSearchEngine: !!process.env.GOOGLE_SEARCH_ENGINE_ID,
    apiKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
    searchEngineLength: process.env.GOOGLE_SEARCH_ENGINE_ID?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    envLoaded: 'Environment variables loaded successfully',
    serviceApiKey: (service as any).apiKey?.length || 0,
    serviceSearchEngine: (service as any).searchEngineId?.length || 0
  });
});

export default router;