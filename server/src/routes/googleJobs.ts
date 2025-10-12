import express from 'express';
import { Request, Response } from 'express';
import { GoogleJobSearchService } from '../services/GoogleJobSearchService';

const router = express.Router();
const googleJobSearch = new GoogleJobSearchService();

// GET /api/jobs/google-search - New Google-based job search
router.get('/google-search', async (req: Request, res: Response) => {
  try {
    const { 
      keywords = 'developer', 
      location = '', 
      limit = 20 
    } = req.query;

    console.log(`🔍 Google job search: "${keywords}" in ${location || 'any location'}`);

    const jobs = await googleJobSearch.searchJobs(
      keywords as string, 
      location as string, 
      parseInt(limit as string)
    );

    res.json({
      success: true,
      jobs: jobs,
      totalCount: jobs.length,
      page: 1,
      totalPages: 1,
      searchParams: { keywords, location, limit: parseInt(limit as string) },
      message: `Found ${jobs.length} jobs via Google search`,
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
      q: keywords = 'developer',
      keywords: altKeywords,
      location = '', 
      limit = 20,
      employmentType,
      experienceLevel,
      datePosted
    } = req.query;

    const searchKeywords = (keywords || altKeywords) as string;
    
    console.log(`🔍 Job search (Google): "${searchKeywords}" in ${location || 'any location'}`);

    const jobs = await googleJobSearch.searchJobs(
      searchKeywords, 
      location as string, 
      parseInt(limit as string)
    );

    // Apply filters if provided
    let filteredJobs = jobs;
    
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

    res.json({
      success: true,
      jobs: filteredJobs,
      totalCount: filteredJobs.length,
      page: 1,
      totalPages: 1,
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
        limit: parseInt(limit as string) 
      },
      message: `Found ${filteredJobs.length} jobs via Google search`,
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
      query = 'developer',
      keywords = 'developer', 
      location = '', 
      limit = 20 
    } = req.query;

    const searchKeywords = (query || keywords) as string;
    
    console.log(`🔍 Simple job search: "${searchKeywords}"`);

    const jobs = await googleJobSearch.searchJobs(
      searchKeywords, 
      location as string, 
      parseInt(limit as string)
    );

    res.json({
      success: true,
      jobs: jobs,
      totalCount: jobs.length,
      page: 1,
      totalPages: 1,
      searchParams: { query: searchKeywords, location, limit: parseInt(limit as string) },
      message: `Found ${jobs.length} jobs`,
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