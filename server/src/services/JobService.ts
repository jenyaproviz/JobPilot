import { Job } from '../models/Job';
import { ScrapingConfig } from '../models/ScrapingConfig';
import { JobScraper } from './JobScraper';
import { defaultScrapingConfigs, israeliJobConfigs } from '../config/scrapingConfigs';
import { IJob, IJobSearchQuery, IJobSearchResponse } from '../types/index';

export class JobService {
  private scraper: JobScraper;

  constructor() {
    this.scraper = new JobScraper();
  }

  async initializeScrapingConfigs(): Promise<void> {
    try {
      const allConfigs = [...defaultScrapingConfigs, ...israeliJobConfigs];
      
      for (const config of allConfigs) {
        await ScrapingConfig.findOneAndUpdate(
          { siteName: config.siteName },
          config,
          { upsert: true, new: true }
        );
      }
      
      console.log('✅ Scraping configurations initialized');
    } catch (error) {
      console.error('❌ Error initializing scraping configs:', error);
    }
  }

  async searchJobs(query: IJobSearchQuery): Promise<IJobSearchResponse> {
    try {
      const {
        keywords,
        location,
        salaryMin,
        salaryMax,
        employmentType,
        experienceLevel,
        datePosted,
        source,
        page = 1,
        limit = 20
      } = query;

      // Build MongoDB query
      const mongoQuery: any = {
        isActive: true,
        $text: { $search: keywords }
      };

      if (location) {
        mongoQuery.location = { $regex: location, $options: 'i' };
      }

      if (employmentType) {
        mongoQuery.employmentType = employmentType;
      }

      if (experienceLevel) {
        mongoQuery.experienceLevel = experienceLevel;
      }

      if (source) {
        mongoQuery.source = source;
      }

      // Date filtering
      if (datePosted && datePosted !== 'all') {
        const now = new Date();
        let dateThreshold: Date;

        switch (datePosted) {
          case 'today':
            dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'week':
            dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            dateThreshold = new Date(0); // No filter
        }

        mongoQuery.postedDate = { $gte: dateThreshold };
      }

      // Salary filtering (if salary is stored as string, we need to parse it)
      if (salaryMin || salaryMax) {
        // This is complex with string salaries, we'll implement basic regex matching
        const salaryQuery: any = {};
        if (salaryMin) {
          salaryQuery.$regex = new RegExp(`\\$${salaryMin}`, 'i');
        }
        if (salaryMax) {
          // This is simplified - in production you'd want better salary parsing
        }
        if (Object.keys(salaryQuery).length > 0) {
          mongoQuery.salary = salaryQuery;
        }
      }

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [jobs, totalCount] = await Promise.all([
        Job.find(mongoQuery)
          .sort({ postedDate: -1, _id: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Job.countDocuments(mongoQuery)
      ]);

      // Get filter options
      const filters = await this.getFilterOptions(keywords, location);

      return {
        jobs: jobs.map(job => ({
          ...job,
          _id: job._id?.toString()
        })) as IJob[],
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
        filters
      };

    } catch (error) {
      console.error('❌ Error searching jobs:', error);
      throw new Error('Failed to search jobs');
    }
  }

  async scrapeJobsFromSites(keywords: string, location: string = '', maxJobsPerSite: number = 50): Promise<{
    success: boolean;
    totalJobs: number;
    jobsBySite: Record<string, number>;
    errors: string[];
  }> {
    const results = {
      success: true,
      totalJobs: 0,
      jobsBySite: {} as Record<string, number>,
      errors: [] as string[]
    };

    try {
      // Get active scraping configurations
      const configs = await ScrapingConfig.find({ isActive: true });
      
      if (configs.length === 0) {
        await this.initializeScrapingConfigs();
        const newConfigs = await ScrapingConfig.find({ isActive: true });
        configs.push(...newConfigs);
      }

      console.log(`🔍 Starting scraping for "${keywords}" in "${location}" from ${configs.length} sites`);

      // Scrape each site sequentially to avoid overwhelming targets
      for (const config of configs) {
        try {
          console.log(`🌐 Scraping ${config.siteName}...`);
          
          const scrapedJobs = await this.scraper.scrapeJobs(
            config.toObject(), 
            keywords, 
            location, 
            maxJobsPerSite
          );

          // Save jobs to database (avoid duplicates)
          let savedCount = 0;
          for (const job of scrapedJobs) {
            try {
              await Job.findOneAndUpdate(
                { originalUrl: job.originalUrl },
                job,
                { upsert: true, new: true }
              );
              savedCount++;
            } catch (saveError) {
              console.warn(`⚠️ Failed to save job from ${config.siteName}:`, saveError);
            }
          }

          results.jobsBySite[config.siteName] = savedCount;
          results.totalJobs += savedCount;

          // Update last scraped time
          await ScrapingConfig.findByIdAndUpdate(config._id, {
            lastScraped: new Date()
          });

          console.log(`✅ ${config.siteName}: ${savedCount} jobs saved`);

          // Add delay between sites to be respectful
          await this.delay(2000);

        } catch (siteError) {
          const errorMessage = `Failed to scrape ${config.siteName}: ${siteError}`;
          console.error(`❌ ${errorMessage}`);
          results.errors.push(errorMessage);
          results.success = false;
        }
      }

      console.log(`🎉 Scraping completed: ${results.totalJobs} total jobs saved`);

    } catch (error) {
      console.error('❌ Critical error during scraping:', error);
      results.success = false;
      results.errors.push(`Critical error: ${error}`);
    }

    return results;
  }

  async saveJob(userId: string, jobId: string): Promise<boolean> {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // This will be implemented when we add the User model operations
      console.log(`💾 Saving job ${jobId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error saving job:', error);
      return false;
    }
  }

  async getJobById(jobId: string): Promise<IJob | null> {
    try {
      const job = await Job.findById(jobId).lean();
      return job ? {
        ...job,
        _id: job._id?.toString()
      } as IJob : null;
    } catch (error) {
      console.error('❌ Error fetching job:', error);
      return null;
    }
  }

  async getJobStats(): Promise<{
    totalJobs: number;
    activeJobs: number;
    jobsBySource: Record<string, number>;
    recentJobs: number;
  }> {
    try {
      const [totalJobs, activeJobs, sourceStats, recentJobs] = await Promise.all([
        Job.countDocuments({}),
        Job.countDocuments({ isActive: true }),
        Job.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$source', count: { $sum: 1 } } }
        ]),
        Job.countDocuments({
          isActive: true,
          postedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      ]);

      const jobsBySource: Record<string, number> = {};
      sourceStats.forEach(stat => {
        jobsBySource[stat._id] = stat.count;
      });

      return {
        totalJobs,
        activeJobs,
        jobsBySource,
        recentJobs
      };
    } catch (error) {
      console.error('❌ Error fetching job stats:', error);
      throw error;
    }
  }

  private async getFilterOptions(keywords?: string, location?: string): Promise<{
    sources: string[];
    locations: string[];
    companies: string[];
    employmentTypes: string[];
  }> {
    try {
      const baseQuery = { isActive: true };
      
      const [sources, locations, companies, employmentTypes] = await Promise.all([
        Job.distinct('source', baseQuery),
        Job.distinct('location', baseQuery),
        Job.distinct('company', baseQuery),
        Job.distinct('employmentType', baseQuery)
      ]);

      return {
        sources: sources.slice(0, 20),
        locations: locations.slice(0, 50),
        companies: companies.slice(0, 100),
        employmentTypes
      };
    } catch (error) {
      console.error('❌ Error fetching filter options:', error);
      return {
        sources: [],
        locations: [],
        companies: [],
        employmentTypes: []
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup(): Promise<void> {
    await this.scraper.close();
  }
}