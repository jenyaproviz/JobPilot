import { Router, Request, Response } from 'express';
import { JobAggregatorService } from '../services/JobAggregatorService';
import { Job } from '../models/Job';
import { PAGINATION_CONSTANTS } from '../constants/pagination';

const router = Router();
const jobAggregator = new JobAggregatorService();

// Search jobs from multiple sources
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { 
      q: keywords = '', 
      location = 'Israel', 
      sources = 'alljobs,drushim', 
      limit = PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE.toString()
    } = req.query;

    if (!keywords || typeof keywords !== 'string') {
      return res.status(400).json({ 
        error: 'Keywords parameter is required',
        message: 'Please provide search keywords using the "q" parameter'
      });
    }

    const sourceArray = typeof sources === 'string' ? sources.split(',') : ['alljobs'];
    const limitNumber = parseInt(limit as string) || PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE;

    console.log(`🔍 API: Searching for "${keywords}" from sources: ${sourceArray.join(', ')}`);

    const jobs = await jobAggregator.searchJobs({
      keywords: keywords as string,
      location: location as string,
      sources: sourceArray,
      limit: limitNumber
    });

    // Optionally save successful searches to database
    try {
      if (jobs.length > 0) {
        const searchRecord = new Job({
          searchQuery: keywords,
          location: location,
          resultsCount: jobs.length,
          sources: sourceArray,
          timestamp: new Date()
        });
        // Note: Only save the search metadata, not the full job listings
        // await searchRecord.save();
      }
    } catch (dbError) {
      console.warn('Could not save search record:', dbError);
    }

    res.json({
      success: true,
      query: {
        keywords,
        location,
        sources: sourceArray,
        limit: limitNumber
      },
      results: {
        count: jobs.length,
        jobs: jobs
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ 
      error: 'Failed to search jobs',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get popular job categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await jobAggregator.getPopularCategories();
    
    res.json({
      success: true,
      categories,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ 
      error: 'Failed to get categories',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get trending keywords
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const keywords = await jobAggregator.getTrendingKeywords();
    
    res.json({
      success: true,
      trending: keywords,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trending keywords error:', error);
    res.status(500).json({ 
      error: 'Failed to get trending keywords',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Quick search suggestions
router.get('/suggest', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Simple suggestion logic - in production you might use elasticsearch or similar
    const suggestions = [
      `${q} developer`,
      `senior ${q}`,
      `${q} engineer`,
      `${q} manager`,
      `junior ${q}`
    ].filter(suggestion => suggestion.toLowerCase().includes(q.toLowerCase()));

    res.json({
      success: true,
      query: q,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;