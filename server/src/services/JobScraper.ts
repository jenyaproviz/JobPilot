import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { IJob, IScrapingConfig } from '../types/index';

export class JobScraper {
  private browser: Browser | null = null;
  private rateLimitMap: Map<string, number[]> = new Map();

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private checkRateLimit(siteName: string, rateLimit: number): boolean {
    const now = Date.now();
    const requests = this.rateLimitMap.get(siteName) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= rateLimit) {
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimitMap.set(siteName, recentRequests);
    return true;
  }

  async scrapeJobs(
    config: IScrapingConfig, 
    keywords: string, 
    location: string = '', 
    maxJobs: number = 50
  ): Promise<IJob[]> {
    if (!this.checkRateLimit(config.siteName, config.rateLimit)) {
      throw new Error(`Rate limit exceeded for ${config.siteName}. Please wait.`);
    }

    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page = await this.browser.newPage();
    
    try {
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      
      // Build search URL
      const searchUrl = this.buildSearchUrl(config, keywords, location);
      console.log(`🔍 Scraping ${config.siteName}: ${searchUrl}`);
      
      // Navigate to search page
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for job listings to load
      await page.waitForSelector(config.selectors.jobCard, { timeout: 10000 });
      
      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const jobs: IJob[] = [];
      const jobCards = $(config.selectors.jobCard);
      
      console.log(`📋 Found ${jobCards.length} job cards on ${config.siteName}`);
      
      for (let i = 0; i < Math.min(jobCards.length, maxJobs); i++) {
        const jobCard = jobCards.eq(i);
        
        try {
          const job = await this.extractJobData(jobCard, config, $);
          if (job && this.isValidJob(job)) {
            jobs.push(job);
          }
        } catch (error) {
          console.warn(`⚠️ Error extracting job ${i + 1}:`, error);
        }
      }
      
      console.log(`✅ Successfully scraped ${jobs.length} jobs from ${config.siteName}`);
      return jobs;
      
    } catch (error) {
      console.error(`❌ Error scraping ${config.siteName}:`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private buildSearchUrl(config: IScrapingConfig, keywords: string, location: string): string {
    let url = config.searchUrl;
    url = url.replace('{keywords}', encodeURIComponent(keywords));
    url = url.replace('{location}', encodeURIComponent(location));
    return url;
  }

  private extractJobData(jobCard: cheerio.Cheerio<any>, config: IScrapingConfig, $: cheerio.CheerioAPI): IJob | null {
    try {
      const title = this.extractText(jobCard, config.selectors.title, $);
      const company = this.extractText(jobCard, config.selectors.company, $);
      const location = this.extractText(jobCard, config.selectors.location, $);
      const link = this.extractLink(jobCard, config.selectors.link, config.baseUrl, $);
      
      if (!title || !company || !link) {
        return null;
      }

      const salary = config.selectors.salary ? 
        this.extractText(jobCard, config.selectors.salary, $) : undefined;
      
      const description = config.selectors.description ? 
        this.extractText(jobCard, config.selectors.description, $) : '';
      
      const postedDateText = config.selectors.postedDate ? 
        this.extractText(jobCard, config.selectors.postedDate, $) : '';

      return {
        title: this.cleanText(title),
        company: this.cleanText(company),
        location: this.cleanText(location),
        salary: salary ? this.cleanText(salary) : undefined,
        description: this.cleanText(description || title), // Fallback to title if no description
        requirements: this.extractRequirements(description || ''),
        employmentType: this.extractEmploymentType(title + ' ' + description),
        experienceLevel: this.extractExperienceLevel(title + ' ' + description),
        source: config.siteName,
        originalUrl: link,
        postedDate: this.parseDate(postedDateText),
        scrapedAt: new Date(),
        keywords: this.extractKeywords(title + ' ' + description),
        isActive: true
      };
    } catch (error) {
      console.warn('Error extracting job data:', error);
      return null;
    }
  }

  private extractText(element: cheerio.Cheerio<any>, selector: string, $: cheerio.CheerioAPI): string {
    const found = element.find(selector).first();
    return found.length > 0 ? found.text().trim() : '';
  }

  private extractLink(element: cheerio.Cheerio<any>, selector: string, baseUrl: string, $: cheerio.CheerioAPI): string {
    const linkElement = element.find(selector).first();
    let href = linkElement.attr('href') || '';
    
    if (href.startsWith('/')) {
      href = baseUrl + href;
    } else if (!href.startsWith('http')) {
      href = baseUrl + '/' + href;
    }
    
    return href;
  }

  private cleanText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  private extractRequirements(description: string): string[] {
    const requirements: string[] = [];
    const keywords = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#',
      'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
      'Git', 'HTML', 'CSS', 'Vue.js', 'Angular', 'Express', 'REST API'
    ];
    
    keywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword.toLowerCase())) {
        requirements.push(keyword);
      }
    });
    
    return [...new Set(requirements)]; // Remove duplicates
  }

  private extractEmploymentType(text: string): 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' {
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('part-time') || lowercaseText.includes('part time')) return 'part-time';
    if (lowercaseText.includes('contract') || lowercaseText.includes('contractor')) return 'contract';
    if (lowercaseText.includes('freelance') || lowercaseText.includes('freelancer')) return 'freelance';
    if (lowercaseText.includes('intern')) return 'internship';
    
    return 'full-time'; // Default
  }

  private extractExperienceLevel(text: string): 'entry' | 'mid' | 'senior' | 'executive' {
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('senior') || lowercaseText.includes('lead') || lowercaseText.includes('principal')) return 'senior';
    if (lowercaseText.includes('junior') || lowercaseText.includes('entry') || lowercaseText.includes('graduate')) return 'entry';
    if (lowercaseText.includes('executive') || lowercaseText.includes('director') || lowercaseText.includes('vp')) return 'executive';
    
    return 'mid'; // Default
  }

  private extractKeywords(text: string): string[] {
    const keywords = text.toLowerCase()
      .split(/[\s,\.\-\(\)]+/)
      .filter(word => word.length > 2)
      .slice(0, 10); // Limit to 10 keywords
    
    return [...new Set(keywords)];
  }

  private parseDate(dateText: string): Date {
    if (!dateText) return new Date();
    
    const now = new Date();
    const lowercaseDate = dateText.toLowerCase();
    
    if (lowercaseDate.includes('today') || lowercaseDate.includes('now')) {
      return now;
    }
    
    if (lowercaseDate.includes('yesterday')) {
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const dayMatch = lowercaseDate.match(/(\d+)\s*day/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }
    
    const weekMatch = lowercaseDate.match(/(\d+)\s*week/);
    if (weekMatch) {
      const weeks = parseInt(weekMatch[1]);
      return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
    }
    
    return now; // Fallback to current date
  }

  private isValidJob(job: IJob): boolean {
    return !!(
      job.title &&
      job.company &&
      job.originalUrl &&
      job.title.length > 2 &&
      job.company.length > 1
    );
  }
}