import axios from 'axios';
import * as cheerio from 'cheerio';
import { IJob } from '../types/index';

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
      
      // Updated AllJobs.co.il search URL structure
      const baseUrl = 'https://www.alljobs.co.il';
      const searchUrl = `${baseUrl}/Jobs/SearchJobs.aspx?FreeText=${encodeURIComponent(keywords)}&page=1`;
      
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 15000,
        maxRedirects: 5
      });
      
      const $ = cheerio.load(response.data);
      const jobs: IJob[] = [];
      
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
      
      console.log(`✅ AllJobs: Found ${jobs.length} jobs`);
      return jobs;
      
    } catch (error) {
      console.error('❌ AllJobs scraping failed:', error);
      // Return empty array if scraping fails - no mock data
      console.log('🚫 No fallback mock data - returning empty results');
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
    try {
      console.log(`💼 Scraping Drushim.co.il for: "${keywords}"`);
      
      const searchUrl = `https://www.drushim.co.il/jobs/search/?q=${encodeURIComponent(keywords)}`;
      
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 15000
      });
      
      const $ = cheerio.load(response.data);
      const jobs: IJob[] = [];
      
      $('.job-item-wrapper, .job-result, .position').each((index, element) => {
        if (index >= limit) return false;
        
        const $job = $(element);
        const title = $job.find('.job-link, .job-title, h2').first().text().trim();
        const company = $job.find('.employer, .company').first().text().trim();
        const location = $job.find('.location, .area').first().text().trim() || 'Israel';
        const description = $job.find('.job-teaser, .description').first().text().trim();
        const jobLink = $job.find('a.job-link, a').first().attr('href');
        const fullUrl = jobLink ? (jobLink.startsWith('http') ? jobLink : `https://www.drushim.co.il${jobLink}`) : searchUrl;
        
        if (title && company) {
          jobs.push({
            _id: `drushim_${Date.now()}_${index}`,
            title,
            company,
            location,
            description: description || `${title} role at ${company}`,
            salary: undefined,
            employmentType: 'full-time' as const,
            experienceLevel: this.extractExperienceLevel(title, description),
            postedDate: new Date(),
            originalUrl: fullUrl,
            source: 'Drushim.co.il',
            requirements: this.extractSkillsFromText(title + ' ' + description),
            keywords: [keywords, 'israel', 'drushim'],
            benefits: [],
            isActive: true,
            scrapedAt: new Date()
          });
        }
      });
      
      console.log(`✅ Drushim: Found ${jobs.length} jobs`);
      return jobs;
      
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

  async searchAllIsraeliSites(keywords: string, location: string = '', limit: number = 20): Promise<IJob[]> {
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
}