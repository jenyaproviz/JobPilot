import express, { Request, Response } from "express";
import { IntelligentJobService } from "../services/IntelligentJobService";
import { IJobSearchQuery, IIntelligentJobSearchResponse } from "../types/index";

const router = express.Router();
const intelligentJobService = new IntelligentJobService();

// Initialize scraping configurations on startup
intelligentJobService.initializeScrapingConfigs();
// Start MCP server for AI capabilities
intelligentJobService.startMCPServer();

// GET /api/jobs - Search and filter jobs
router.get("/", async (req: Request, res: Response) => {
  try {
    const query: IJobSearchQuery = {
      keywords: req.query.keywords as string || '',
      location: req.query.location as string,
      salaryMin: req.query.salaryMin ? parseInt(req.query.salaryMin as string) : undefined,
      salaryMax: req.query.salaryMax ? parseInt(req.query.salaryMax as string) : undefined,
      employmentType: req.query.employmentType as string,
      experienceLevel: req.query.experienceLevel as string,
      datePosted: req.query.datePosted as 'today' | 'week' | 'month' | 'all',
      source: req.query.source as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    // Validate required fields
    if (!query.keywords || query.keywords.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Keywords parameter is required'
      });
    }

    const results = await intelligentJobService.searchJobs(query);
    
    res.json({
      success: true,
      data: results,
      message: `Found ${results.totalCount} jobs matching your criteria`
    });

  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search jobs',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/jobs/:id - Get specific job details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    const job = await intelligentJobService.getJobById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job,
      message: 'Job retrieved successfully'
    });

  } catch (error) {
    console.error('Error in GET /api/jobs/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/jobs/scrape - Trigger job scraping
router.post("/scrape", async (req: Request, res: Response) => {
  try {
    const { keywords, location, maxJobsPerSite } = req.body;

    if (!keywords || keywords.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Keywords are required for scraping'
      });
    }

    // Start scraping in the background
    console.log(`🚀 Starting scrape job for "${keywords}" in "${location || 'any location'}"`);
    
    // For now, we'll run this synchronously, but in production you'd want to queue this
    const results = await intelligentJobService.scrapeJobsFromSites(
      keywords,
      location || '',
      maxJobsPerSite || 50
    );

    res.json({
      success: results.success,
      data: {
        totalJobs: results.totalJobs,
        jobsBySite: results.jobsBySite,
        errors: results.errors
      },
      message: `Scraping completed. Found ${results.totalJobs} new jobs.`
    });

  } catch (error) {
    console.error('Error in POST /api/jobs/scrape:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate job scraping',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/jobs/stats - Get job statistics
router.get("/stats/overview", async (req: Request, res: Response) => {
  try {
    const stats = await intelligentJobService.getJobStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'Job statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error in GET /api/jobs/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/jobs/:id/save - Save a job to user's saved jobs (requires auth)
router.post("/:id/save", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Get user ID from JWT token when auth is implemented
    const userId = req.body.userId || 'temp-user'; // Temporary

    const success = await intelligentJobService.saveJob(userId, id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Job saved successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to save job'
      });
    }

  } catch (error) {
    console.error('Error in POST /api/jobs/:id/save:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save job',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/jobs/intelligent - Intelligent job search with AI scoring
router.get("/intelligent", async (req: Request, res: Response) => {
  try {
    const query: IJobSearchQuery = {
      keywords: req.query.keywords as string || '',
      location: req.query.location as string,
      salaryMin: req.query.salaryMin ? parseInt(req.query.salaryMin as string) : undefined,
      salaryMax: req.query.salaryMax ? parseInt(req.query.salaryMax as string) : undefined,
      employmentType: req.query.employmentType as string,
      experienceLevel: req.query.experienceLevel as string,
      datePosted: req.query.datePosted as 'today' | 'week' | 'month' | 'all',
      source: req.query.source as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const userSkills = req.query.skills ? (req.query.skills as string).split(',') : [];
    const optimizeKeywords = req.query.optimize === 'true';

    // Validate required fields
    if (!query.keywords || query.keywords.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Keywords parameter is required'
      });
    }

    const results = await intelligentJobService.intelligentSearchJobs(query, {
      useAI: true,
      optimizeKeywords,
      userProfile: userSkills.length > 0 ? {
        skills: userSkills,
        experience: req.query.experience as string || 'mid',
        preferences: {}
      } : undefined
    }) as IIntelligentJobSearchResponse;

    res.json({
      success: true,
      data: results,
      message: `🤖 AI-enhanced search found ${results.totalCount} jobs${results.aiEnhanced ? ' with intelligent scoring' : ''}`
    });

  } catch (error) {
    console.error('Error in GET /api/jobs/intelligent:', error);
    res.status(500).json({
      success: false,
      message: 'AI-enhanced job search failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/jobs/recommendations - Get personalized job recommendations
router.get("/recommendations", async (req: Request, res: Response) => {
  try {
    const skills = req.query.skills ? (req.query.skills as string).split(',') : [];
    const experience = req.query.experience as string || 'mid';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skills parameter is required for recommendations'
      });
    }

    const userProfile = {
      skills,
      experience,
      preferences: {
        remote: req.query.remote === 'true',
        salaryMin: req.query.salaryMin ? parseInt(req.query.salaryMin as string) : undefined,
        location: req.query.location as string
      }
    };

    const result = await intelligentJobService.getJobRecommendations(userProfile, limit);

    res.json({
      success: result.success,
      data: result.data,
      message: result.success ? 
        `🎯 Generated ${result.data.jobs.length} personalized recommendations` : 
        result.error
    });

  } catch (error) {
    console.error('Error in GET /api/jobs/recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate job recommendations',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/jobs/:id/analyze - Get AI analysis of a specific job
router.get("/:id/analyze", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const skills = req.query.skills ? (req.query.skills as string).split(',') : undefined;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    const userProfile = skills ? {
      skills,
      experience: req.query.experience as string || 'mid',
      preferences: {}
    } : undefined;

    const result = await intelligentJobService.analyzeJobDetails(id, userProfile);

    res.json({
      success: result.success,
      data: result.data,
      message: result.success ? 
        '🔍 Job analysis completed with AI insights' : 
        result.error
    });

  } catch (error) {
    console.error('Error in GET /api/jobs/:id/analyze:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze job',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/jobs/market/trends - Get AI-powered job market trends
router.get("/market/trends", async (req: Request, res: Response) => {
  try {
    const timeframe = req.query.timeframe as string || 'month';
    const industry = req.query.industry as string;

    const result = await intelligentJobService.getJobMarketTrends(timeframe, industry);

    res.json({
      success: result.success,
      data: result.data,
      message: result.success ? 
        `📊 Job market trends for ${timeframe} analyzed` : 
        result.error
    });

  } catch (error) {
    console.error('Error in GET /api/jobs/market/trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze market trends',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/jobs/keywords/optimize - Get keyword optimization suggestions
router.get("/keywords/optimize", async (req: Request, res: Response) => {
  try {
    const keywords = req.query.keywords as string;
    const currentCount = req.query.currentCount ? parseInt(req.query.currentCount as string) : undefined;

    if (!keywords || keywords.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Keywords parameter is required'
      });
    }

    const result = await intelligentJobService.getKeywordSuggestions(keywords, currentCount);

    res.json({
      success: result.success,
      data: result.data,
      message: result.success ? 
        '💡 Keyword optimization suggestions generated' : 
        result.error
    });

  } catch (error) {
    console.error('Error in GET /api/jobs/keywords/optimize:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize keywords',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/jobs/scrape/intelligent - Enhanced scraping with AI insights
router.post("/scrape/intelligent", async (req: Request, res: Response) => {
  try {
    const { keywords, location, userProfile } = req.body;

    if (!keywords || keywords.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Keywords are required for intelligent scraping'
      });
    }

    console.log(`🤖 Starting intelligent scrape for "${keywords}" in "${location || 'any location'}"`);
    
    const results = await intelligentJobService.enhanceJobScraping(
      keywords,
      location || '',
      userProfile
    );

    res.json({
      success: results.success,
      data: {
        totalJobs: results.totalJobs,
        jobsBySite: results.jobsBySite,
        aiEnhanced: results.aiEnhanced,
        insights: results.insights,
        errors: results.errors
      },
      message: `🎯 Intelligent scraping completed. Found ${results.totalJobs} jobs${results.aiEnhanced ? ' with AI insights' : ''}.`
    });

  } catch (error) {
    console.error('Error in POST /api/jobs/scrape/intelligent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform intelligent scraping',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/jobs/test/scrape-config - Test endpoint to check scraping configurations
router.get("/test/scrape-config", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: "Scraping configurations test endpoint",
      availableSites: [
        'indeed', 'glassdoor', 'linkedin', 'monster', 'dice', 
        'drushim', 'alljobs', 'jobnet'
      ],
      aiFeatures: [
        'Intelligent job matching',
        'Keyword optimization',
        'Personalized recommendations',
        'Job market trend analysis',
        'Skill-based job scoring',
        'AI-powered job insights'
      ]
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint failed'
    });
  }
});

export default router;
