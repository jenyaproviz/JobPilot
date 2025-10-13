import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { IJob } from '../types/index';
import { PAGINATION_CONSTANTS } from '../constants/pagination';

export class IsraeliJobScraper {
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  async scrapeAllJobs(keywords: string, location: string = '', limit: number = 10): Promise<IJob[]> {
    try {
      console.log(`🇮🇱 Scraping AllJobs.co.il for: "${keywords}"`);
      
      // Updated AllJobs.co.il search URL structure - now uses homepage with query parameter
      const baseUrl = 'https://www.alljobs.co.il';
      const searchUrl = `${baseUrl}/?q=${encodeURIComponent(keywords)}`;
      
      console.log(`📡 Requesting URL: ${searchUrl}`);
      
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 15000,
        maxRedirects: 5
      });
      
      console.log(`📄 Response status: ${response.status}`);
      console.log(`📄 Response length: ${response.data.length}`);
      
      const $ = cheerio.load(response.data);
      const jobs: IJob[] = [];
      
      // Debug: Check what selectors are available
      console.log(`🔍 Found elements: .JobListRow=${$('.JobListRow').length}, .JobListItem=${$('.JobListItem').length}, .job-row=${$('.job-row').length}, .job-item=${$('.job-item').length}`);
      console.log(`🔍 Job-related IDs: #aj-popular-jobs=${$('#aj-popular-jobs').length}, [id*="job"]=${$('[id*="job" i]').length}`);
      console.log(`🔍 Page title: ${$('title').text()}`);
      console.log(`🔍 Total elements on page: divs=${$('div').length}, links=${$('a').length}`);
      
      // Updated selectors for AllJobs current structure
      $('.JobListRow, .JobListItem, .job-row, .job-item').each((index, element) => {
        if (index >= limit) return false;
        
        const $job = $(element);
        const titleElement = $job.find('.JobTitle a, .job-title a, h2 a, h3 a').first();
        const title = titleElement.text().trim() || $job.find('.JobTitle, .job-title, h2, h3').first().text().trim();
        const company = $job.find('.CompanyName, .company-name, .company').first().text().trim();
        const jobLocation = $job.find('.JobLocation, .job-location, .location').first().text().trim() || location || 'Israel';
        const description = $job.find('.JobDescription, .job-description, .description').first().text().trim();
        const jobLink = titleElement.attr('href') || $job.find('a').first().attr('href');
        const fullUrl = jobLink ? (jobLink.startsWith('http') ? jobLink : `${baseUrl}${jobLink}`) : searchUrl;
        
        // Extract salary if available
        const salaryText = $job.find('.salary, .Salary, .wage').first().text().trim();
        const salary = salaryText ? salaryText : undefined;
        
        if (title && company) {
          jobs.push({
            _id: `alljobs_${Date.now()}_${index}`,
            title,
            company,
            location: jobLocation,
            description: description || `${title} position at ${company} in ${jobLocation}`,
            salary,
            employmentType: 'full-time' as const,
            experienceLevel: this.extractExperienceLevel(title, description),
            postedDate: new Date(),
            originalUrl: fullUrl,
            source: 'AllJobs.co.il',
            requirements: this.extractSkillsFromText(title + ' ' + description),
            keywords: [keywords, 'israel', 'hebrew'],
            benefits: [],
            isActive: true,
            scrapedAt: new Date()
          });
        }
      });
      
      if (jobs.length === 0) {
        console.log('⚠️  AllJobs: No jobs found. This may be because AllJobs.co.il now uses JavaScript to dynamically load job listings.');
        console.log('💡 Consider using Puppeteer for dynamic content or alternative job sites like Drushim.');
      }
      
      console.log(`✅ AllJobs: Found ${jobs.length} jobs`);
      return jobs;
      
    } catch (error) {
      console.error('❌ AllJobs scraping failed:', error);
      console.log('🚫 Returning empty results for AllJobs');
      return [];
    }
  }

  async scrapeTechIt(keywords: string, location: string = '', limit: number = 10): Promise<IJob[]> {
    try {
      console.log(`💻 Scraping TechIt.co.il for: "${keywords}"`);
      
      // TechIt.co.il search - they focus on tech jobs
      const searchUrl = `https://www.techit.co.il/jobs?q=${encodeURIComponent(keywords)}`;
      
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 15000,
        maxRedirects: 5
      });
      
      const $ = cheerio.load(response.data);
      const jobs: IJob[] = [];
      
      // TechIt specific selectors
      $('.job-card, .job-item, .position-item').each((index, element) => {
        if (index >= limit) return false;
        
        const $job = $(element);
        const title = $job.find('.job-title, .position-title, h2, h3').first().text().trim();
        const company = $job.find('.company, .employer, .company-name').first().text().trim();
        const location = $job.find('.location, .area, .city').first().text().trim() || 'Tel Aviv, Israel';
        const description = $job.find('.description, .job-desc').first().text().trim();
        const salary = $job.find('.salary, .wage').first().text().trim();
        const jobLink = $job.find('a').first().attr('href');
        const fullUrl = jobLink ? (jobLink.startsWith('http') ? jobLink : `https://www.techit.co.il${jobLink}`) : searchUrl;
        
        if (title && company) {
          jobs.push({
            _id: `techit_${Date.now()}_${index}`,
            title,
            company,
            location,
            description: description || `${title} position at ${company} - Tech role in Israel`,
            salary: salary || undefined,
            employmentType: 'full-time' as const,
            experienceLevel: this.extractExperienceLevel(title, description),
            postedDate: new Date(),
            originalUrl: fullUrl,
            source: 'TechIt.co.il',
            requirements: this.extractTechSkills(title + ' ' + description),
            keywords: [keywords, 'tech', 'israel', 'hitech'],
            benefits: ['Tech Industry', 'Israeli Market'],
            isActive: true,
            scrapedAt: new Date()
          });
        }
      });
      
      console.log(`✅ TechIt: Found ${jobs.length} jobs`);
      return jobs;
      
    } catch (error) {
      console.error('❌ TechIt scraping failed:', error);
      console.log('🚫 No fallback mock data - returning empty results');
      return [];
    }
  }

  async scrapeDrushim(keywords: string, location: string = '', limit: number = 10): Promise<IJob[]> {
    // Use Puppeteer for better dynamic content handling
    let browser = null;
    try {
      console.log(`💼 Scraping Drushim.co.il with Puppeteer for: "${keywords}"`);
      
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      
      const searchUrl = `https://www.drushim.co.il/jobs/search/?q=${encodeURIComponent(keywords)}`;
      console.log(`📡 Puppeteer navigating to: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait for job results to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log(`🔍 Extracting job data from Drushim...`);
      
      const jobs = await page.evaluate((limit: number) => {
        const jobElements = document.querySelectorAll('.job-item-wrapper, .job-result, .position, .job-card, [class*="job"]');
        const extractedJobs: any[] = [];
        
        console.log(`Found ${jobElements.length} potential job elements on Drushim`);
        
        jobElements.forEach((element, index) => {
          if (index >= limit) return;
          
          // Try multiple selectors for title
          const titleElement = element.querySelector('.job-link, .job-title, h2, h3, .title, [class*="title"]') as HTMLElement;
          const title = titleElement ? titleElement.innerText.trim() : '';
          
          // Try multiple selectors for company
          const companyElement = element.querySelector('.employer, .company, .company-name, [class*="company"]') as HTMLElement;
          const company = companyElement ? companyElement.innerText.trim() : '';
          
          // Try multiple selectors for location
          const locationElement = element.querySelector('.location, .area, .city, [class*="location"]') as HTMLElement;
          const jobLocation = locationElement ? locationElement.innerText.trim() : 'Israel';
          
          // Try to get description
          const descElement = element.querySelector('.job-teaser, .description, .desc, .summary') as HTMLElement;
          const description = descElement ? descElement.innerText.trim() : '';
          
          // Try to get job link
          const linkElement = element.querySelector('a.job-link, a[href*="/job"], a') as HTMLAnchorElement;
          const jobLink = linkElement ? linkElement.href : '';
          
          if (title && company) {
            extractedJobs.push({
              title,
              company,
              location: jobLocation,
              description: description || `${title} position at ${company}`,
              originalUrl: jobLink,
              elementHTML: element.outerHTML.substring(0, 300) // For debugging
            });
          }
        });
        
        return extractedJobs;
      }, limit);
      
      // Convert to IJob format
      const formattedJobs: IJob[] = jobs.map((job, index) => ({
        _id: `drushim_puppeteer_${Date.now()}_${index}`,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: undefined,
        employmentType: 'full-time' as const,
        experienceLevel: this.extractExperienceLevel(job.title, job.description),
        postedDate: new Date(),
        originalUrl: job.originalUrl || searchUrl,
        source: 'Drushim.co.il (Puppeteer)',
        requirements: this.extractSkillsFromText(job.title + ' ' + job.description),
        keywords: [keywords, 'israel', 'drushim'],
        benefits: ['Israeli Job Market'],
        isActive: true,
        scrapedAt: new Date()
      }));
      
      console.log(`✅ Drushim (Puppeteer): Found ${formattedJobs.length} jobs`);
      return formattedJobs;
      
    } catch (error) {
      console.error('❌ Drushim scraping failed:', error);
      console.log('🚫 No fallback mock data - returning empty results');
      return [];
    }
  }

  async scrapeJobNet(keywords: string, location: string = '', limit: number = 10): Promise<IJob[]> {
    try {
      console.log(`🌐 Scraping JobNet.co.il for: "${keywords}"`);
      
      const searchUrl = `https://www.jobnet.co.il/jobs?q=${encodeURIComponent(keywords)}`;
      
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      const jobs: IJob[] = [];
      
      $('.job, .job-item, .position-card').each((index, element) => {
        if (index >= limit) return false;
        
        const $job = $(element);
        const title = $job.find('.title, .job-title, h3').first().text().trim();
        const company = $job.find('.company, .employer').first().text().trim();
        const location = $job.find('.location, .city').first().text().trim() || 'Israel';
        const description = $job.find('.description, .summary').first().text().trim();
        const jobLink = $job.find('a').first().attr('href');
        const fullUrl = jobLink ? (jobLink.startsWith('http') ? jobLink : `https://www.jobnet.co.il${jobLink}`) : searchUrl;
        
        if (title && company) {
          jobs.push({
            _id: `jobnet_${Date.now()}_${index}`,
            title,
            company,
            location,
            description: description || `${title} position at ${company}`,
            salary: undefined,
            employmentType: 'full-time' as const,
            experienceLevel: this.extractExperienceLevel(title, description),
            postedDate: new Date(),
            originalUrl: fullUrl,
            source: 'JobNet.co.il',
            requirements: this.extractSkillsFromText(title + ' ' + description),
            keywords: [keywords, 'israel', 'jobnet'],
            benefits: [],
            isActive: true,
            scrapedAt: new Date()
          });
        }
      });
      
      console.log(`✅ JobNet: Found ${jobs.length} jobs`);
      return jobs;
      
    } catch (error) {
      console.error('❌ JobNet scraping failed:', error);
      console.log('🚫 No fallback mock data - returning empty results');
      return [];
    }
  }

  async searchAllIsraeliSites(keywords: string, location: string = '', limit: number = PAGINATION_CONSTANTS.DEFAULT_RESULTS_PER_PAGE): Promise<IJob[]> {
    console.log(`🇮🇱 Starting Israeli job search for: "${keywords}"`);
    console.log('🔍 Searching across Israeli job sites: AllJobs, TechIt, Drushim, JobNet...');
    
    const limitPerSite = Math.ceil(limit / 4);
    
    const [
      allJobsResults,
      techItResults,
      drushimResults,
      jobNetResults
    ] = await Promise.allSettled([
      this.scrapeAllJobs(keywords, location, limitPerSite),
      this.scrapeTechIt(keywords, location, limitPerSite),
      this.scrapeDrushim(keywords, location, limitPerSite),
      this.scrapeJobNet(keywords, location, limitPerSite)
    ]);

    let allJobs: IJob[] = [];
    
    if (allJobsResults.status === 'fulfilled') allJobs.push(...allJobsResults.value);
    if (techItResults.status === 'fulfilled') allJobs.push(...techItResults.value);
    if (drushimResults.status === 'fulfilled') allJobs.push(...drushimResults.value);
    if (jobNetResults.status === 'fulfilled') allJobs.push(...jobNetResults.value);

    // Remove duplicates based on title and company
    const uniqueJobs = allJobs.filter((job, index, self) =>
      index === self.findIndex(j => 
        j.title.toLowerCase() === job.title.toLowerCase() && 
        j.company.toLowerCase() === job.company.toLowerCase()
      )
    );

    // Sort by relevance (jobs with keywords in title get priority)
    uniqueJobs.sort((a, b) => {
      const aRelevant = a.title.toLowerCase().includes(keywords.toLowerCase()) ? 1 : 0;
      const bRelevant = b.title.toLowerCase().includes(keywords.toLowerCase()) ? 1 : 0;
      return bRelevant - aRelevant;
    });

    const finalJobs = uniqueJobs.slice(0, limit);
    
    console.log(`✅ Israeli job search completed: ${finalJobs.length} jobs found across ${new Set(finalJobs.map(j => j.source)).size} sites`);
    console.log(`📊 Results breakdown:`, finalJobs.reduce((acc, job) => {
      acc[job.source] = (acc[job.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    return finalJobs;
  }

  // Mock data method removed - using only real scraping

  private extractExperienceLevel(title: string, description: string): 'entry' | 'mid' | 'senior' | 'executive' {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('בכיר')) return 'senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate') || text.includes('זוטר')) return 'entry';
    if (text.includes('intern') || text.includes('trainee') || text.includes('מתמחה')) return 'entry';
    
    return 'mid';
  }

  private extractSkillsFromText(text: string): string[] {
    const skills: string[] = [];
    const techKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 
      'Java', 'C#', 'PHP', 'Ruby', '.NET', 'Spring',
      'HTML', 'CSS', 'SASS', 'MongoDB', 'PostgreSQL', 'MySQL',
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git',
      'Hebrew', 'English', 'Team Work', 'Communication'
    ];
    
    techKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        skills.push(keyword);
      }
    });
    
    return skills.slice(0, 5);
  }

  private extractTechSkills(text: string): string[] {
    const skills: string[] = [];
    const techKeywords = [
      'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 
      'Java', 'C#', 'Go', 'Kubernetes', 'Docker', 'AWS', 'Azure',
      'Machine Learning', 'AI', 'Data Science', 'Full Stack', 'Frontend', 'Backend',
      'Mobile Development', 'DevOps', 'Cloud', 'Microservices'
    ];
    
    techKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        skills.push(keyword);
      }
    });
    
    return skills.slice(0, 6);
  }

  // JobMaster.co.il scraper
  async scrapeJobMaster(keywords: string, location: string = '', limit: number = 10): Promise<IJob[]> {
    try {
      console.log(`🇮🇱 Scraping JobMaster.co.il for: "${keywords}"`);
      
      const baseUrl = 'https://www.jobmaster.co.il';
      const searchUrl = `${baseUrl}/jobs/?q=${encodeURIComponent(keywords)}`;
      
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 15000,
        maxRedirects: 5
      });
      
      const $ = cheerio.load(response.data);
      const jobs: IJob[] = [];
      
      $('.job-item, .job-card, .position-item').each((index, element) => {
        if (index >= limit) return false;
        
        const $job = $(element);
        const title = $job.find('.job-title, .position-title, h2, h3').first().text().trim();
        const company = $job.find('.company-name, .employer, .company').first().text().trim();
        const jobLocation = $job.find('.location, .area, .city').first().text().trim() || location || 'Israel';
        const description = $job.find('.description, .summary').first().text().trim();
        const jobLink = $job.find('a').first().attr('href');
        const fullUrl = jobLink ? (jobLink.startsWith('http') ? jobLink : `${baseUrl}${jobLink}`) : searchUrl;
        
        if (title && company) {
          jobs.push({
            _id: `jobmaster_${Date.now()}_${index}`,
            title,
            company,
            location: jobLocation,
            description: description || `${title} position at ${company}`,
            salary: undefined,
            requirements: [],
            employmentType: 'full-time',
            experienceLevel: 'mid',
            source: 'JobMaster.co.il',
            originalUrl: fullUrl,
            postedDate: new Date(),
            scrapedAt: new Date(),
            keywords: this.extractTechSkills(title + ' ' + description),
            isActive: true
          });
        }
      });

      console.log(`✅ JobMaster: Found ${jobs.length} jobs`);
      return jobs;

    } catch (error) {
      console.error('❌ JobMaster scraping failed:', error);
      return [];
    }
  }

  // Got Friends scraper (Tech-focused)
  async scrapeGotFriends(keywords: string, location: string = '', limit: number = 10): Promise<IJob[]> {
    try {
      console.log(`🇮🇱 Scraping Got Friends for: "${keywords}"`);
      
      // Note: Got Friends may require different approach - this is a basic implementation
      const baseUrl = 'https://www.gotfriends.co.il';
      const searchUrl = `${baseUrl}/jobs?search=${encodeURIComponent(keywords)}`;
      
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 15000,
        maxRedirects: 5
      });
      
      const $ = cheerio.load(response.data);
      const jobs: IJob[] = [];
      
      $('.job-listing, .position-card, .job-item').each((index, element) => {
        if (index >= limit) return false;
        
        const $job = $(element);
        const title = $job.find('.job-title, .position-name, h2, h3').first().text().trim();
        const company = $job.find('.company, .employer, .company-name').first().text().trim();
        const jobLocation = $job.find('.location, .city').first().text().trim() || location || 'Tel Aviv, Israel';
        const description = $job.find('.description, .summary, .job-desc').first().text().trim();
        const jobLink = $job.find('a').first().attr('href');
        const fullUrl = jobLink ? (jobLink.startsWith('http') ? jobLink : `${baseUrl}${jobLink}`) : searchUrl;
        
        if (title && company) {
          jobs.push({
            _id: `gotfriends_${Date.now()}_${index}`,
            title,
            company,
            location: jobLocation,
            description: description || `${title} position at ${company}`,
            salary: undefined,
            requirements: [],
            employmentType: 'full-time',
            experienceLevel: 'mid',
            source: 'Got Friends',
            originalUrl: fullUrl,
            postedDate: new Date(),
            scrapedAt: new Date(),
            keywords: this.extractTechSkills(title + ' ' + description),
            isActive: true
          });
        }
      });

      console.log(`✅ Got Friends: Found ${jobs.length} jobs`);
      return jobs;

    } catch (error) {
      console.error('❌ Got Friends scraping failed:', error);
      return [];
    }
  }
}