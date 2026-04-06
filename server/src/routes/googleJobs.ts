import express from 'express';
import { Request, Response } from 'express';
import { GoogleJobSearchService } from '../services/GoogleJobSearchService';
import { PAGINATION_CONSTANTS } from '../constants/pagination';

const router = express.Router();
const googleJobSearch = new GoogleJobSearchService();

const normalizeExperienceLevel = (value?: string): string => {
  const normalized = (value || '').toLowerCase();
  if (normalized.includes('entry') || normalized.includes('junior')) return 'entry';
  if (normalized.includes('senior') || normalized.includes('lead') || normalized.includes('principal')) return 'senior';
  if (normalized.includes('executive')) return 'executive';
  return normalized || 'mid';
};

const normalizeEmploymentType = (value?: string): string => {
  const normalized = (value || '').toLowerCase();
  if (normalized.includes('part')) return 'part-time';
  if (normalized.includes('contract')) return 'contract';
  if (normalized.includes('freelance')) return 'freelance';
  if (normalized.includes('intern')) return 'internship';
  return 'full-time';
};

const normalizeJobs = (jobs: any[]): any[] => {
  return jobs.map((job, index) => ({
    ...job,
    _id: job._id || job.id || `google_${Date.now()}_${index}`,
    originalUrl: job.originalUrl || job.url || job.link || '#',
    url: job.url || job.originalUrl || job.link || '#',
    salary: job.salary || job.salaryRange || 'Not specified',
    postedDate: job.postedDate || job.datePosted || new Date().toISOString().split('T')[0],
    datePosted: job.datePosted || job.postedDate || new Date().toISOString().split('T')[0],
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    keywords: Array.isArray(job.keywords) ? job.keywords : [],
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
    employmentType: normalizeEmploymentType(job.employmentType),
    experienceLevel: normalizeExperienceLevel(job.experienceLevel),
  }));
};

const normalizeSearchResult = (searchResult: any, fallbackLimit: number) => {
  const jobs = normalizeJobs(Array.isArray(searchResult?.jobs) ? searchResult.jobs : []);
  const totalResultsAvailable = typeof searchResult?.totalResultsAvailable === 'number'
    ? searchResult.totalResultsAvailable
    : typeof searchResult?.totalCount === 'number'
      ? searchResult.totalCount
      : jobs.length;
  const maxResultsReturnable = typeof searchResult?.maxResultsReturnable === 'number'
    ? searchResult.maxResultsReturnable
    : Math.max(totalResultsAvailable, fallbackLimit, jobs.length);

  return {
    jobs,
    totalResultsAvailable,
    maxResultsReturnable,
  };
};

const performGoogleSearch = async (
  keywords: string,
  location: string,
  limit: number,
  startIndex: number = 1
) => {
  const searchResult = await (googleJobSearch as any).searchJobs(keywords, location, limit, startIndex);
  return normalizeSearchResult(searchResult, limit);
};

const tokenizeKeywords = (value: string): string[] => {
  return [...new Set(
    value
      .split(/[\n,;\/\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 1)
  )];
};

const matchesTerm = (haystack: string, term: string): boolean => {
  const normalizedHaystack = haystack.toLowerCase();
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) {
    return false;
  }

  if (normalizedTerm.includes(' ')) {
    return normalizedHaystack.includes(normalizedTerm);
  }

  const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(normalizedHaystack);
};

const toLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const normalizeVisibleMatchScore = (rawScore: number): number => {
  if (rawScore <= 0) {
    return 0;
  }

  return Math.round(40 + (Math.min(rawScore, 100) * 0.6));
};

const addMatchScoring = (
  jobs: any[],
  options: {
    keywords: string;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
  }
) => {
  const requestedTerms = tokenizeKeywords(options.keywords);

  return jobs.map((job) => {
    const titleHaystack = [job.title, ...(job.requirements || [])].join(' ').toLowerCase();
    const fullHaystack = [
      job.title,
      job.company,
      job.location,
      job.description,
      ...(job.requirements || []),
      ...(job.keywords || [])
    ].join(' ').toLowerCase();

    const matchedTerms = requestedTerms.filter((term) => matchesTerm(fullHaystack, term));
    const matchedInTitle = requestedTerms.filter((term) => matchesTerm(titleHaystack, term));
    const missingTerms = requestedTerms.filter((term) => !matchedTerms.includes(term)).slice(0, 5);

    let score = 0;

    if (requestedTerms.length > 0) {
      score += Math.round((matchedTerms.length / requestedTerms.length) * 70);
      score += Math.min(matchedInTitle.length * 10, 20);
    }

    if (options.location && String(job.location || '').toLowerCase().includes(options.location.toLowerCase())) {
      score += 10;
    }

    if (options.employmentType && options.employmentType !== 'any') {
      if (String(job.employmentType || '').toLowerCase() === options.employmentType.toLowerCase()) {
        score += 5;
      }
    }

    if (options.experienceLevel && options.experienceLevel !== 'any') {
      if (String(job.experienceLevel || '').toLowerCase() === options.experienceLevel.toLowerCase()) {
        score += 5;
      }
    }

    const rawScore = Math.max(0, Math.min(100, score));
    const matchScore = normalizeVisibleMatchScore(rawScore);

    return {
      ...job,
      matchScore,
      aiAnalysis: {
        matchingSkills: matchedTerms.map(toLabel),
        missingSkills: missingTerms.map(toLabel),
        recommendations: missingTerms.length > 0
          ? [`Try refining with ${missingTerms.slice(0, 2).join(', ')} to improve targeting.`]
          : ['Strong alignment with your current search terms.'],
        overallAssessment: matchScore >= 75
          ? 'High match'
          : matchScore >= 50
            ? 'Moderate match'
            : 'Low match'
      }
    };
  });
};

// GET /api/jobs/google-search - New Google-based job search
router.get('/google-search', async (req: Request, res: Response) => {
  try {
    const { 
      keywords = PAGINATION_CONSTANTS.DEFAULT_KEYWORDS, 
      location = PAGINATION_CONSTANTS.DEFAULT_LOCATION, 
      limit = PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE 
    } = req.query;

    console.log(`🔍 Google job search: "${keywords}" in ${location || 'any location'}`);

    const searchResult = await performGoogleSearch(
      keywords as string, 
      location as string, 
      parseInt(limit as string)
    );

    const scoredJobs = addMatchScoring(searchResult.jobs, {
      keywords: keywords as string,
      location: location as string
    });

    res.json({
      success: true,
      jobs: scoredJobs,
      totalCount: scoredJobs.length,
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
    const searchResult = await performGoogleSearch(
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
        const pageResult = await performGoogleSearch(
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

    const scoredJobs = addMatchScoring(paginatedJobs, {
      keywords: searchKeywords,
      location: location as string,
      employmentType: employmentType as string | undefined,
      experienceLevel: experienceLevel as string | undefined
    });

    res.json({
      success: true,
      jobs: scoredJobs,
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

    const searchResult = await performGoogleSearch(
      searchKeywords, 
      location as string, 
      parseInt(limit as string)
    );

    const scoredJobs = addMatchScoring(searchResult.jobs, {
      keywords: searchKeywords,
      location: location as string
    });

    res.json({
      success: true,
      jobs: scoredJobs,
      totalCount: scoredJobs.length,
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