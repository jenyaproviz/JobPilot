import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// Import JobSitesService - using require to import JS file
const { JobSitesService } = require('../services/JobSitesService.js');
const jobSitesService = new JobSitesService();

// GET /api/job-sites - Get all job sites
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await jobSitesService.getAllSites();
    res.json(result);
  } catch (error) {
    console.error('Error fetching job sites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job sites'
    });
  }
});

// GET /api/job-sites/stats - Get job sites statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await jobSitesService.getAllSites();
    if (result.success) {
      const sites = result.data.sites;
      const stats = {
        totalSites: sites.length,
        featuredSites: sites.filter((site: any) => site.featured).length,
        categories: [...new Set(sites.map((site: any) => site.category))].length,
        locations: [...new Set(sites.map((site: any) => site.location))].length
      };
      
      res.json({
        success: true,
        data: stats
      });
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error fetching job sites stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job sites statistics'
    });
  }
});

export default router;