import { IsraeliJobScraper } from './IsraeliJobScraper';
import { IJob } from '../types/index';

export interface SearchJobsRequest {
  keywords: string;
  location?: string;
  sources?: string[];
  limit?: number;
}

export class JobAggregatorService {
  private israeliScraper: IsraeliJobScraper;
  
  constructor() {
    this.israeliScraper = new IsraeliJobScraper();
  }

  async searchJobs(request: SearchJobsRequest): Promise<IJob[]> {
    const { keywords, location = 'Israel', sources = ['alljobs', 'drushim', 'jobmaster'], limit = 20 } = request;
    const allJobs: IJob[] = [];
    const perSourceLimit = Math.ceil(limit / sources.length);

    console.log(`🔍 Starting job search for "${keywords}" in ${location}`);

    // Scrape from multiple sources in parallel
    const scrapePromises = sources.map(async (source) => {
      try {
        switch (source.toLowerCase()) {
          case 'alljobs':
            return await this.israeliScraper.scrapeAllJobs(keywords, location, perSourceLimit);
          case 'drushim':
            return await this.israeliScraper.scrapeDrushim(keywords, location, perSourceLimit);
          case 'techit':
            return await this.israeliScraper.scrapeTechIt(keywords, location, perSourceLimit);
          case 'jobnet':
            return await this.israeliScraper.scrapeJobNet(keywords, location, perSourceLimit);
          case 'jobmaster':
            return await this.israeliScraper.scrapeJobMaster(keywords, location, perSourceLimit);
          case 'gotfriends':
            return await this.israeliScraper.scrapeGotFriends(keywords, location, perSourceLimit);
          default:
            console.warn(`Unknown job source: ${source}`);
            return [];
        }
      } catch (error) {
        console.error(`Error scraping ${source}:`, error);
        return [];
      }
    });

    // Wait for all scraping to complete
    const results = await Promise.allSettled(scrapePromises);
    
    // Collect successful results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
        console.log(`✅ ${sources[index]}: Found ${result.value.length} jobs`);
      } else {
        console.error(`❌ ${sources[index]}: Failed -`, result.reason);
      }
    });

    // Remove duplicates and limit results
    const uniqueJobs = this.removeDuplicateJobs(allJobs);
    const limitedJobs = uniqueJobs.slice(0, limit);

    console.log(`🎯 Total unique jobs found: ${uniqueJobs.length}, returning: ${limitedJobs.length}`);
    
    return limitedJobs;
  }

  private removeDuplicateJobs(jobs: IJob[]): IJob[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`.replace(/\s+/g, '');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Method to get popular job categories from scraped data
  async getPopularCategories(): Promise<{ name: string; count: number }[]> {
    try {
      // Sample popular tech and general categories in Israel
      const categories = [
        { name: 'Software Development', count: 245 },
        { name: 'Product Management', count: 123 },
        { name: 'DevOps & Infrastructure', count: 89 },
        { name: 'Data Science & Analytics', count: 76 },
        { name: 'UI/UX Design', count: 54 },
        { name: 'Sales & Marketing', count: 167 },
        { name: 'Customer Success', count: 98 },
        { name: 'Finance & Accounting', count: 132 }
      ];
      
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Method to get trending keywords
  async getTrendingKeywords(): Promise<string[]> {
    return [
      'React Developer',
      'Full Stack',
      'Product Manager',
      'DevOps Engineer',
      'Data Scientist',
      'Frontend Developer',
      'Backend Developer',
      'Sales Manager',
      'Marketing Manager',
      'Customer Success'
    ];
  }
}