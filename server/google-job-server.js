const express = require("express");
const cors = require("cors");
const { GoogleJobSearchService } = require("./src/services/GoogleJobSearchService.js");
const { JobSitesService } = require("./src/services/JobSitesService.js");
const { sendContactEmail } = require("./dist/controllers/contact.js");

class GoogleJobPilotServer {
  constructor() {
    this.app = express();
    this.googleJobService = new GoogleJobSearchService();
    this.jobSitesService = new JobSitesService();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'], // React frontend URLs
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint (both paths for compatibility)
    const healthHandler = (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          service: 'Google JobPilot Server',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          features: {
            googleCustomSearchAPI: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
            fallbackSearch: true,
            globalJobSearch: true
          }
        },
        message: 'Server is healthy and ready'
      });
    };
    
    this.app.get('/health', healthHandler);
    this.app.get('/api/health', healthHandler);

    // Contact endpoint - Send contact emails
    this.app.post('/api/contact', async (req, res) => {
      try {
        await sendContactEmail(req, res);
      } catch (error) {
        console.error('❌ Contact endpoint error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to send message. Please try again.'
        });
      }
    });

    // Job sites search endpoint - Browse real job search platforms
    this.app.get('/api/jobs/search', async (req, res) => {
      try {
        const {
          q: query = '',
          category = '',
          location = '',
          featured = false
        } = req.query;

        console.log(`🌍 Job Sites Search Request:`, {
          query,
          category,
          location,
          featured: featured === 'true'
        });

        const filters = {
          category: category.trim(),
          location: location.trim(),
          featured: featured === 'true'
        };

        // Search job sites
        const searchResults = await this.jobSitesService.searchSites(query.trim(), filters);

        // Return job sites instead of jobs
        res.json(searchResults);

      } catch (error) {
        console.error('❌ Job search endpoint error:', error);
        
        res.status(500).json({
          success: false,
          data: {
            jobs: [],
            totalCount: 0,
            page: 1,
            totalPages: 0,
            filters: {
              sources: [],
              locations: [],
              companies: [],
              employmentTypes: []
            }
          },
          error: 'Internal server error during job search',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Get all job sites
    this.app.get('/api/job-sites', async (req, res) => {
      try {
        const result = await this.jobSitesService.getAllSites();
        res.json(result);
      } catch (error) {
        console.error('❌ Get job sites error:', error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    });

    // Get featured job sites
    this.app.get('/api/job-sites/featured', async (req, res) => {
      try {
        const result = await this.jobSitesService.getFeaturedSites();
        res.json(result);
      } catch (error) {
        console.error('❌ Get featured sites error:', error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    });

    // Get job site by ID
    this.app.get('/api/job-sites/:id', async (req, res) => {
      try {
        const result = await this.jobSitesService.getSiteById(req.params.id);
        res.json(result);
      } catch (error) {
        console.error('❌ Get site by ID error:', error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    });

    // Get job sites statistics
    this.app.get('/api/job-sites/stats', async (req, res) => {
      try {
        const result = await this.jobSitesService.getStats();
        res.json(result);
      } catch (error) {
        console.error('❌ Get stats error:', error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    });

    // Legacy endpoint for backward compatibility (now returns job sites)
    this.app.get('/api/jobs', async (req, res) => {
      console.log(`🔄 Legacy endpoint accessed, redirecting to job sites`);
      
      try {
        const result = await this.jobSitesService.getAllSites();
        res.json(result);
      } catch (error) {
        console.error('❌ Legacy endpoint error:', error);
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    });

    // Job suggestions endpoint (now returns site categories)
    this.app.get('/api/jobs/suggestions', async (req, res) => {
      try {
        const { q = '' } = req.query;
        const result = await this.jobSitesService.searchSites(q);
        res.json({
          success: true,
          suggestions: result.data.sites.map(site => site.category).filter((v, i, a) => a.indexOf(v) === i)
        });
      } catch (error) {
        console.error('❌ Job suggestions error:', error);
        res.status(500).json({
          success: false,
          suggestions: [],
          message: error.message
        });
      }
    });

    // Popular job sites endpoint
    this.app.get('/api/jobs/popular', (req, res) => {
      const popularCategories = [
        { category: 'General Jobs', count: 8, sites: ['AllJobs.co.il', 'Drushim.co.il', 'Indeed Israel'] },
        { category: 'Tech Jobs', count: 2, sites: ['TechIT.co.il', 'Got Friends'] },
        { category: 'Tech Giants', count: 1, sites: ['Google Careers'] },
        { category: 'Professional Network', count: 2, sites: ['LinkedIn Jobs', 'Dialog.co.il'] },
        { category: 'Executive Jobs', count: 1, sites: ['Ethosia'] }
      ];
      
      res.json({
        success: true,
        data: { categories: popularCategories },
        message: 'Popular job categories retrieved successfully'
      });
    });

    // Popular searches endpoint
    this.app.get('/api/jobs/popular', (req, res) => {
      const popularSearches = [
        { keywords: 'javascript developer', count: 1250 },
        { keywords: 'react developer', count: 980 },
        { keywords: 'python engineer', count: 875 },
        { keywords: 'full stack developer', count: 756 },
        { keywords: 'software engineer', count: 692 },
        { keywords: 'data scientist', count: 543 },
        { keywords: 'devops engineer', count: 421 },
        { keywords: 'mobile developer', count: 387 },
        { keywords: 'ui ux designer', count: 334 },
        { keywords: 'product manager', count: 298 }
      ];

      res.json({
        success: true,
        popularSearches: popularSearches,
        lastUpdated: new Date().toISOString()
      });
    });

    // Search statistics endpoint
    this.app.get('/api/jobs/stats', async (req, res) => {
      try {
        // Sample quick searches to get statistics
        const sampleSearches = [
          'developer',
          'engineer', 
          'manager',
          'analyst',
          'designer'
        ];

        let totalJobs = 0;
        const searchStats = [];

        for (const keyword of sampleSearches.slice(0, 3)) { // Limit to 3 to avoid quota issues
          try {
            const result = await this.googleJobService.searchJobs(keyword, { limit: 10 });
            totalJobs += result.totalCount || 0;
            searchStats.push({
              keyword,
              count: result.totalCount || 0,
              success: result.success
            });
          } catch (error) {
            searchStats.push({
              keyword,
              count: 0,
              success: false,
              error: error.message
            });
          }
        }

        res.json({
          success: true,
          statistics: {
            totalJobsAvailable: totalJobs,
            searchStats: searchStats,
            apiStatus: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
            lastUpdated: new Date().toISOString()
          }
        });

      } catch (error) {
        res.json({
          success: false,
          error: error.message,
          statistics: {
            totalJobsAvailable: 0,
            searchStats: [],
            apiStatus: false,
            lastUpdated: new Date().toISOString()
          }
        });
      }
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
          'GET /health',
          'GET /api/jobs/search?q={keywords}&location={location}',
          'GET /api/jobs?q={keywords}&location={location} (legacy)',
          'GET /api/jobs/suggestions?q={partial_keywords}',
          'GET /api/jobs/popular',
          'GET /api/jobs/stats'
        ],
        message: 'Use /api/jobs/search for job searching with Google'
      });
    });
  }

  /**
   * Generate search suggestions based on partial input
   */
  generateSearchSuggestions(partialQuery) {
    const allSuggestions = [
      // Programming & Development
      'javascript developer', 'react developer', 'vue developer', 'angular developer',
      'node.js developer', 'typescript developer', 'python developer', 'java developer',
      'c# developer', 'php developer', 'ruby developer', 'go developer', 'rust developer',
      'full stack developer', 'frontend developer', 'backend developer', 'web developer',
      'mobile developer', 'ios developer', 'android developer', 'flutter developer',
      'react native developer', 'unity developer', 'game developer',
      
      // Engineering Roles
      'software engineer', 'senior software engineer', 'principal engineer',
      'devops engineer', 'cloud engineer', 'infrastructure engineer', 'site reliability engineer',
      'machine learning engineer', 'ai engineer', 'data engineer', 'platform engineer',
      
      // Data & Analytics
      'data scientist', 'data analyst', 'business analyst', 'product analyst',
      'data engineer', 'business intelligence analyst', 'statistician',
      
      // Design & UX
      'ui designer', 'ux designer', 'ui/ux designer', 'product designer',
      'graphic designer', 'web designer', 'interaction designer',
      
      // Management & Leadership
      'product manager', 'project manager', 'engineering manager', 'technical lead',
      'scrum master', 'product owner', 'cto', 'vp engineering',
      
      // Specialized Roles
      'cybersecurity analyst', 'security engineer', 'penetration tester',
      'qa engineer', 'test automation engineer', 'quality assurance',
      'technical writer', 'solutions architect', 'cloud architect'
    ];

    const query = partialQuery.toLowerCase().trim();
    
    if (!query) {
      return allSuggestions.slice(0, 10); // Return top 10 popular suggestions
    }

    // Filter suggestions that match the partial query
    const matches = allSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query)
    );

    return matches.slice(0, 8); // Return up to 8 matching suggestions
  }

  /**
   * Start the server
   */
  start(port = 3001) {
    const PORT = process.env.PORT || port;
    
    this.server = this.app.listen(PORT, () => {
      console.log(`🌍 Google JobPilot Server running on port ${PORT}`);
      console.log(`📡 API Endpoints:`);
      console.log(`   - GET http://localhost:${PORT}/api/jobs/search?q=keywords&location=location`);
      console.log(`   - GET http://localhost:${PORT}/api/jobs/suggestions?q=partial_keywords`);
      console.log(`   - GET http://localhost:${PORT}/api/jobs/popular`);
      console.log(`   - GET http://localhost:${PORT}/api/jobs/stats`);
      console.log(`   - GET http://localhost:${PORT}/health`);
      console.log('🔍 Powered by Google Custom Search API');
      console.log('🌐 Global Job Search - Any job, anywhere on the internet!');
      
      // Check API configuration
      const hasApiKey = !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID);
      if (hasApiKey) {
        console.log('✅ Google Custom Search API configured');
      } else {
        console.log('⚠️ Google API not configured - running in fallback mode');
        console.log('📚 See GOOGLE_SETUP.md for configuration instructions');
      }
    });

    // Graceful shutdown handling
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));

    return this.server;
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown(signal) {
    console.log(`🔄 ${signal} received - Shutting down gracefully...`);
    
    if (this.server) {
      this.server.close(() => {
        console.log('✅ Google JobPilot Server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new GoogleJobPilotServer();
  server.start();
}

module.exports = { GoogleJobPilotServer };