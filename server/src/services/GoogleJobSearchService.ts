import axios from 'axios';
import * as cheerio from 'cheerio';
import { PAGINATION_CONSTANTS, GOOGLE_API_CONSTANTS } from '../constants/pagination';
import { JobSitesService } from './JobSitesService';
import { JobAggregatorService } from './JobAggregatorService';

interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
}

interface JobResult {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  employmentType: string;
  experienceLevel: string;
  postedDate: string;
  originalUrl: string;
  source: string;
  requirements: string[];
  keywords: string[];
  benefits: string[];
  isActive: boolean;
  scrapedAt: Date;
}

interface JobSearchResult {
  jobs: JobResult[];
  totalResultsAvailable: number;
  maxResultsReturnable: number;
}

export class GoogleJobSearchService {
  private readonly jobSitesService = new JobSitesService();
  private readonly jobAggregatorService = new JobAggregatorService();

  private get apiKey(): string {
    return process.env.GOOGLE_API_KEY || '';
  }
  
  private get searchEngineId(): string {
    return process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  }

  constructor() {
    // Environment variables will be checked at runtime, not construction time
  }

  private buildQueryTokens(...parts: string[]): string[] {
    return parts
      .join(' ')
      .toLowerCase()
      .split(/[^\p{L}\p{N}#+.-]+/u)
      .map((token) => token.trim())
      .filter((token) => token.length > 1);
  }

  private buildGoogleHtmlFallbackQuery(keywords: string, location: string): string {
    const query = [keywords.trim(), location.trim()].filter(Boolean).join(' ').trim();
    if (!query) {
      return 'jobs';
    }

    return /\b(job|jobs|career|careers|vacancy|position)\b/i.test(query)
      ? query
      : `${query} jobs`;
  }

  private buildGoogleHtmlHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    };
  }

  private async searchGoogleHtmlFallback(
    keywords: string,
    location: string,
    limit: number,
    startIndex: number
  ): Promise<JobSearchResult | null> {
    try {
      const response = await axios.get<string>('https://www.google.com/search', {
        params: {
          hl: 'en',
          q: this.buildGoogleHtmlFallbackQuery(keywords, location),
          start: Math.max(startIndex - 1, 0)
        },
        headers: this.buildGoogleHtmlHeaders(),
        timeout: GOOGLE_API_CONSTANTS.REQUEST_TIMEOUT
      });

      const $ = cheerio.load(response.data);
      const seen = new Set<string>();
      const jobs: JobResult[] = [];

      $('a[href^="/url?q="]').each((index, element) => {
        if (jobs.length >= limit) {
          return false;
        }

        const href = $(element).attr('href');
        if (!href) {
          return;
        }

        const targetUrl = decodeURIComponent(href.replace('/url?q=', '').split('&')[0]);
        if (!targetUrl.startsWith('http')) {
          return;
        }

        if (seen.has(targetUrl)) {
          return;
        }

        if (
          targetUrl.includes('google.com') ||
          targetUrl.includes('cse.google.com')
        ) {
          return;
        }

        const title = $(element).find('h3').first().text().trim();
        if (!title) {
          return;
        }

        const container = $(element).closest('div');
        const snippet = container.find('span').map((_, span) => $(span).text().trim()).get().join(' ').trim();
        const sourceHost = (() => {
          try {
            return new URL(targetUrl).hostname.replace(/^www\./, '');
          } catch {
            return 'job board';
          }
        })();

        seen.add(targetUrl);
        jobs.push({
          _id: `google_html_${Date.now()}_${index}`,
          title: this.cleanTitle(title),
          company: this.extractCompany(sourceHost, title),
          location: this.extractLocation(snippet) || location || 'Not specified',
          description: this.cleanDescription(snippet || `${title} on ${sourceHost}`),
          salary: this.extractSalary(snippet) || 'Not specified',
          employmentType: this.extractEmploymentType(snippet),
          experienceLevel: this.guessExperienceLevel(`${title} ${snippet}`),
          postedDate: this.extractPostDate(snippet) || new Date().toISOString().split('T')[0],
          originalUrl: targetUrl,
          source: this.getJobSite(sourceHost),
          requirements: this.extractRequirements(snippet, keywords),
          keywords: [keywords.toLowerCase(), ...this.extractKeywords(snippet)],
          benefits: this.extractBenefits(snippet),
          isActive: true,
          scrapedAt: new Date()
        });
      });

      if (jobs.length === 0) {
        return null;
      }

      return {
        jobs,
        totalResultsAvailable: jobs.length,
        maxResultsReturnable: jobs.length
      };
    } catch (error) {
      console.warn('⚠️ HTML Google fallback failed:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  private mapScrapedJobsToSearchResult(jobs: any[]): JobSearchResult {
    return {
      jobs: jobs.map((job, index) => ({
        _id: job._id || `scraped_${Date.now()}_${index}`,
        title: job.title,
        company: job.company,
        location: job.location || 'Israel',
        description: job.description || `${job.title} position at ${job.company}`,
        salary: job.salary || 'Not specified',
        employmentType: job.employmentType || 'full-time',
        experienceLevel: job.experienceLevel || 'mid',
        postedDate: job.postedDate instanceof Date
          ? job.postedDate.toISOString().split('T')[0]
          : job.postedDate || new Date().toISOString().split('T')[0],
        originalUrl: job.originalUrl || '#',
        source: job.source || 'Job Board',
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        keywords: Array.isArray(job.keywords) ? job.keywords : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],
        isActive: job.isActive !== false,
        scrapedAt: job.scrapedAt instanceof Date ? job.scrapedAt : new Date(job.scrapedAt || Date.now())
      })),
      totalResultsAvailable: jobs.length,
      maxResultsReturnable: jobs.length
    };
  }

  private async buildFallbackSearchResults(
    keywords: string,
    location: string,
    limit: number,
    startIndex: number
  ): Promise<JobSearchResult> {
    // Fetch a much larger pool than the page size so sparse sources do not cap
    // the final result count to only a handful of jobs.
    const requestedPoolSize = Math.max(limit * 4, 60);
    const scrapedJobs = await this.jobAggregatorService.searchJobs({
      keywords,
      location,
      sources: ['alljobs', 'jobmaster', 'gotfriends', 'drushim', 'techit', 'jobnet'],
      limit: requestedPoolSize
    });

    const googleHtmlResults = await this.searchGoogleHtmlFallback(keywords, location, requestedPoolSize, startIndex);
    const combinedJobs = this.deduplicateJobsByUrl([
      ...this.mapScrapedJobsToSearchResult(scrapedJobs).jobs,
      ...(googleHtmlResults?.jobs ?? [])
    ]);

    if (combinedJobs.length > 0) {
      const zeroBasedStart = Math.max(startIndex - 1, 0);
      const pagedJobs = combinedJobs.slice(zeroBasedStart, zeroBasedStart + limit);
      return {
        jobs: pagedJobs,
        totalResultsAvailable: combinedJobs.length,
        maxResultsReturnable: combinedJobs.length
      };
    }

    const siteResponse = await this.jobSitesService.getAllSites();
    const allSites = siteResponse.data.sites;
    const queryTokens = this.buildQueryTokens(keywords, location);
    const queryText = [keywords.trim(), location.trim()].filter(Boolean).join(' ').toLowerCase();
    const keywordParts = this.buildQueryTokens(keywords);

    const rankedSites = [...allSites]
      .map((site) => {
        let score = site.featured ? 4 : 0;
        const haystack = `${site.name} ${site.description} ${site.category} ${site.location}`.toLowerCase();

        for (const token of queryTokens) {
          if (haystack.includes(token)) {
            score += 2;
          }
        }

        if (queryTokens.length > 0 && queryTokens.every((token) => haystack.includes(token))) {
          score += 4;
        }

        if (queryText.includes('remote') && site.location.toLowerCase().includes('remote')) {
          score += 3;
        }

        if (queryText.includes('hybrid') && /global|tech|professional/i.test(`${site.location} ${site.category}`)) {
          score += 1;
        }

        return { site, score };
      })
      .sort((left, right) => right.score - left.score);

    const totalResultsAvailable = rankedSites.length;
    const zeroBasedStart = Math.max(startIndex - 1, 0);
    const selectedSites = rankedSites.slice(zeroBasedStart, zeroBasedStart + limit);

    const jobs = selectedSites.map(({ site }, index) => ({
      _id: `site_search_${site.id}_${zeroBasedStart + index + 1}`,
      title: `Search ${keywords} jobs on ${site.name}`,
      company: site.name,
      location: location || site.location,
      description: `Open the real ${site.name} search page for ${keywords}${location ? ` in ${location}` : ''}. This fallback keeps results usable when the Google Custom Search API is unavailable.`,
      salary: 'See site listing',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      postedDate: new Date().toISOString().split('T')[0],
      originalUrl: this.buildJobBoardSearchUrl(site.id, keywords, location),
      source: site.name,
      requirements: keywordParts,
      keywords: keywordParts,
      benefits: [],
      isActive: true,
      scrapedAt: new Date()
    }));

    return {
      jobs,
      totalResultsAvailable,
      maxResultsReturnable: totalResultsAvailable
    };
  }

  private deduplicateJobsByUrl(jobs: JobResult[]): JobResult[] {
    const seen = new Set<string>();

    return jobs.filter((job) => {
      const url = (job.originalUrl || '').trim().toLowerCase();
      if (!url || seen.has(url)) {
        return false;
      }

      seen.add(url);
      return true;
    });
  }

  private buildJobBoardSearchUrl(siteId: string, keywords: string, location: string): string {
    const encodedKeywords = encodeURIComponent(keywords.trim());
    const encodedLocation = encodeURIComponent(location.trim());

    switch (siteId) {
      case 'linkedin':
        return `https://www.linkedin.com/jobs/search/?keywords=${encodedKeywords}&location=${encodedLocation}`;
      case 'indeed':
        return `https://www.indeed.com/jobs?q=${encodedKeywords}&l=${encodedLocation}`;
      case 'glassdoor':
        return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedKeywords}`;
      case 'monster':
        return `https://www.monster.com/jobs/search/?q=${encodedKeywords}&where=${encodedLocation}`;
      case 'ziprecruiter':
        return `https://www.ziprecruiter.com/jobs-search?search=${encodedKeywords}&location=${encodedLocation}`;
      case 'dice':
        return `https://www.dice.com/jobs?q=${encodedKeywords}&location=${encodedLocation}`;
      case 'angel':
        return `https://wellfound.com/jobs?query=${encodedKeywords}`;
      case 'remote':
        return `https://remote.co/remote-jobs/search/?search_keywords=${encodedKeywords}`;
      case 'weworkremotely':
        return `https://weworkremotely.com/remote-jobs/search?term=${encodedKeywords}`;
      case 'upwork':
        return `https://www.upwork.com/nx/jobs/search/?q=${encodedKeywords}`;
      case 'freelancer':
        return `https://www.freelancer.com/jobs/${encodedKeywords}`;
      case 'alljobs':
        return `https://www.alljobs.co.il/SearchResultsGuest.aspx?page=1&position=&type=&freetxt=${encodeURIComponent([keywords, location].filter(Boolean).join(' '))}&city=&region=`;
      case 'drushim':
        return `https://www.drushim.co.il/jobs/search/?q=${encodeURIComponent([keywords, location].filter(Boolean).join(' '))}`;
      case 'jobmaster':
        return `https://www.jobmaster.co.il/jobs/?q=${encodeURIComponent([keywords, location].filter(Boolean).join(' '))}`;
      case 'gotfriends':
        return `https://www.gotfriends.co.il/jobs?search=${encodeURIComponent([keywords, location].filter(Boolean).join(' '))}`;
      case 'techit':
        return `https://www.techit.co.il/jobs?q=${encodeURIComponent([keywords, location].filter(Boolean).join(' '))}`;
      case 'jobnet':
        return `https://www.jobnet.co.il/jobs?q=${encodeURIComponent([keywords, location].filter(Boolean).join(' '))}`;
      case 'stackoverflow':
        return 'https://stackoverflow.com/jobs';
      case 'github':
        return 'https://github.com/about/careers';
      default:
        return `https://www.google.com/search?q=${encodeURIComponent(`${keywords} ${location} jobs`)}`;
    }
  }

  private formatGoogleApiError(error: any): string {
    const status = error?.response?.status;
    const apiMessage = error?.response?.data?.error?.message;

    if (status === 403) {
      return 'Google Custom Search API rejected the request with 403 Forbidden. Check that the API key is valid for Custom Search JSON API and that the programmable search engine is configured correctly.';
    }

    if (status === 429) {
      return 'Google Custom Search API quota exceeded. Please check your API usage limits.';
    }

    if (apiMessage) {
      return `Google Custom Search API error: ${apiMessage}`;
    }

    return error?.message || 'Unknown Google API error';
  }

  async searchJobs(keywords: string, location: string = PAGINATION_CONSTANTS.DEFAULT_LOCATION, limit: number = PAGINATION_CONSTANTS.MAX_RESULTS_LIMIT, startIndex: number = 1): Promise<JobSearchResult> {
    console.log(`🔍 Google search for jobs: "${keywords}" in ${location || 'Any location'}`);
    
    try {
      // Build search query
      const searchQuery = this.buildSearchQuery(keywords, location);
      
      // Require API keys - no mock results
      if (!this.apiKey || !this.searchEngineId) {
        console.warn('⚠️ Google API keys are not configured. Falling back to direct job-board search links.');
        return this.buildFallbackSearchResults(keywords, location, limit, startIndex);
      }

      console.log(`🌍 Searching Google with query: "${searchQuery}"`);
      
      // Google API limits to 10 results per request, so we make multiple requests if needed
      const maxPerRequest = GOOGLE_API_CONSTANTS.MAX_RESULTS_PER_REQUEST;
      const totalRequests = Math.ceil(Math.min(limit, PAGINATION_CONSTANTS.MAX_API_RESULTS) / maxPerRequest); // Cap at API results total
      const allResults: GoogleSearchResult[] = [];
      let totalResultsAvailable = 0;
      let firstRequestFailure: string | null = null;

      for (let requestIndex = 0; requestIndex < totalRequests; requestIndex++) {
        const currentStartIndex = startIndex + (requestIndex * maxPerRequest);
        const numResults = Math.min(maxPerRequest, limit - allResults.length);
        
        if (numResults <= 0) break;

        try {
          const response = await axios.get<GoogleSearchResponse>('https://www.googleapis.com/customsearch/v1', {
            params: {
              key: this.apiKey,
              cx: this.searchEngineId,
              q: searchQuery,
              num: numResults,
              start: currentStartIndex
            },
            timeout: GOOGLE_API_CONSTANTS.REQUEST_TIMEOUT
          });

          // Capture total results from first response
          if (requestIndex === 0 && response.data.searchInformation?.totalResults) {
            totalResultsAvailable = parseInt(response.data.searchInformation.totalResults);
            console.log(`📊 Google reports ${totalResultsAvailable.toLocaleString()} total results available`);
          }

          if (response.data.items && response.data.items.length > 0) {
            allResults.push(...response.data.items);
            console.log(`✅ Request ${requestIndex + 1}: Found ${response.data.items.length} results (total: ${allResults.length})`);
          }
        } catch (requestError: any) {
          const formattedError = this.formatGoogleApiError(requestError);
          console.error(`❌ Google search request ${requestIndex + 1} error:`, formattedError);

          if (requestIndex === 0 && allResults.length === 0) {
            firstRequestFailure = formattedError;
            break;
          }

          // Continue with other requests only if we already have some results
          break;
        }
      }

      if (firstRequestFailure) {
        throw new Error(firstRequestFailure);
      }

      if (allResults.length > 0) {
        console.log(`✅ Found ${allResults.length} job results from Google (${totalResultsAvailable.toLocaleString()} total available)`);
        return {
          jobs: this.parseGoogleResults(allResults, keywords, location),
          totalResultsAvailable: totalResultsAvailable,
          maxResultsReturnable: PAGINATION_CONSTANTS.MAX_API_RESULTS // Google API limitation
        };
      } else {
        console.log('❌ No job results found from Google Custom Search');
        return {
          jobs: [],
          totalResultsAvailable: totalResultsAvailable,
          maxResultsReturnable: PAGINATION_CONSTANTS.MAX_API_RESULTS
        };
      }

    } catch (error: any) {
      console.error('❌ Google search error:', error);
      if (error?.response?.status === 429 || error.message?.includes('quotaExceeded')) {
        console.warn('⚠️ Google API quota exceeded. Falling back to direct job-board search links.');
        return this.buildFallbackSearchResults(keywords, location, limit, startIndex);
      }

      if (error?.response?.status === 403 || error.message?.includes('403 Forbidden')) {
        console.warn('⚠️ Google API rejected the request. Falling back to direct job-board search links.');
        return this.buildFallbackSearchResults(keywords, location, limit, startIndex);
      }

      throw new Error(`Google search failed: ${error.message || 'Unknown error'}`);
    }
  }

  private buildSearchQuery(keywords: string, location: string): string {
    let query = `${keywords} jobs`;
    
    if (location) {
      query += ` ${location}`;
    }
    
    // Add job-related terms and site filters for better results
    query += ' hiring OR careers OR vacancy OR position';
    query += ' site:linkedin.com OR site:indeed.com OR site:glassdoor.com OR site:stackoverflow.com/jobs OR site:alljobs.co.il OR site:drushim.co.il OR site:jobmaster.co.il OR site:techit.co.il';
    
    return query;
  }

  private parseGoogleResults(items: GoogleSearchResult[], keywords: string, location: string): JobResult[] {
    return items.map((item, index) => {
      const jobId = `google_${Date.now()}_${index}`;
      
      // Extract company from display link or title
      const company = this.extractCompany(item.displayLink, item.title);
      
      // Extract location from snippet or use provided location
      const extractedLocation = this.extractLocation(item.snippet) || location || 'Not specified';
      
      // Determine job site
      const source = this.getJobSite(item.displayLink);
      
      // Clean up the description to remove Google search artifacts
      const cleanDescription = this.cleanDescription(item.snippet);
      
      // Extract salary if mentioned in snippet
      const salary = this.extractSalary(item.snippet) || 'Not specified';
      
      return {
        _id: jobId,
        title: this.cleanTitle(item.title),
        company: company,
        location: extractedLocation,
        description: cleanDescription,
        salary: salary,
        employmentType: this.extractEmploymentType(item.snippet),
        experienceLevel: this.guessExperienceLevel(item.title + ' ' + item.snippet),
        postedDate: this.extractPostDate(item.snippet) || new Date().toISOString().split('T')[0],
        originalUrl: this.cleanUrl(item.link),
        source: source,
        requirements: this.extractRequirements(item.snippet, keywords),
        keywords: [keywords.toLowerCase(), ...this.extractKeywords(item.snippet)],
        benefits: this.extractBenefits(item.snippet),
        isActive: true,
        scrapedAt: new Date()
      };
    });
  }

  private extractCompany(displayLink: string, title: string): string {
    // Try to extract company from title patterns
    const companyPatterns = [
      /at\s+([^-|•·\n]+?)(?:\s*[-|•·]|\s*$)/i,
      /hiring[\s:]([^-|•·\n]+?)(?:\s*[-|•·]|\s*$)/i,
      /join\s+([^-|•·\n]+?)(?:\s*[-|•·]|\s*$)/i,
      /([^-|•·\n]+?)\s+is\s+hiring/i,
      /([^-|•·\n]+?)\s+jobs?/i
    ];

    for (const pattern of companyPatterns) {
      const match = title.match(pattern);
      if (match && match[1]) {
        const company = match[1].trim();
        if (company.length > 2 && company.length < 50) {
          return company;
        }
      }
    }

    // If no company found in title, try to get from domain
    if (displayLink) {
      const domain = displayLink.replace(/^www\./, '').split('.')[0];
      const knownSites = ['linkedin', 'indeed', 'glassdoor', 'stackoverflow', 'alljobs', 'drushim'];
      
      if (!knownSites.includes(domain.toLowerCase())) {
        return this.capitalize(domain);
      }
    }

    return 'Company not specified';
  }

  private extractLocation(snippet: string): string | null {
    // Common location patterns
    const locationPatterns = [
      /(?:in|at|located in)\s+([A-Za-z\s,]+?)(?:\s|,|\.|$)/i,
      /(Tel Aviv|Jerusalem|Haifa|Beer Sheva|Herzliya|Ramat Gan|Petah Tikva|Remote)/i,
      /(New York|London|San Francisco|Los Angeles|Chicago|Seattle|Boston)/i
    ];

    for (const pattern of locationPatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }

  private getJobSite(displayLink: string): string {
    if (displayLink.includes('linkedin.com')) return 'LinkedIn';
    if (displayLink.includes('indeed.com')) return 'Indeed';
    if (displayLink.includes('glassdoor.com')) return 'Glassdoor';
    if (displayLink.includes('alljobs.co.il')) return 'AllJobs.co.il';
    if (displayLink.includes('drushim.co.il')) return 'Drushim.co.il';
    if (displayLink.includes('techit.co.il')) return 'TechIT.co.il';
    return 'Job Board';
  }

  private cleanTitle(title: string): string {
    // Remove common suffixes
    return title
      .replace(/\s*-\s*(LinkedIn|Indeed|Glassdoor|AllJobs|Drushim).*$/i, '')
      .replace(/\s*\|\s*.*$/i, '')
      .trim();
  }

  private guessExperienceLevel(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
      return 'senior';
    }
    if (titleLower.includes('junior') || titleLower.includes('entry') || titleLower.includes('graduate')) {
      return 'junior';
    }
    return 'mid';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private cleanDescription(snippet: string): string {
    if (!snippet) return 'No description available';
    
    // Remove search result artifacts and clean up
    return snippet
      .replace(/\s+/g, ' ')
      .replace(/\.{3,}/g, '...')
      .trim();
  }

  private extractSalary(snippet: string): string | null {
    const salaryPatterns = [
      /[\$₪€£]\s*[\d,]+(?:\s*-\s*[\$₪€£]?\s*[\d,]+)?/g,
      /\b\d{1,3}(?:,\d{3})*(?:\s*-\s*\d{1,3}(?:,\d{3})*)?\s*(?:USD|EUR|ILS|GBP|per\s+year|annually)/gi,
      /salary[:\s]*[\$₪€£]?\s*[\d,]+/gi
    ];

    for (const pattern of salaryPatterns) {
      const match = snippet.match(pattern);
      if (match) return match[0];
    }
    return null;
  }

  private extractEmploymentType(snippet: string): string {
    const fullTimePatterns = /\b(full[\s-]?time|permanent|staff)\b/i;
    const partTimePatterns = /\b(part[\s-]?time|temporary|contract)\b/i;
    const freelancePatterns = /\b(freelance|consultant|independent)\b/i;

    if (fullTimePatterns.test(snippet)) return 'full-time';
    if (partTimePatterns.test(snippet)) return 'part-time';
    if (freelancePatterns.test(snippet)) return 'contract';
    
    return 'full-time'; // default
  }

  private extractPostDate(snippet: string): string | null {
    // Look for recent posting indicators
    const recentPatterns = [
      /posted\s+(\d+)\s+days?\s+ago/i,
      /(\d+)\s+days?\s+ago/i,
      /posted\s+today/i,
      /posted\s+yesterday/i
    ];

    for (const pattern of recentPatterns) {
      const match = snippet.match(pattern);
      if (match) {
        if (match[0].includes('today')) {
          return new Date().toISOString().split('T')[0];
        } else if (match[0].includes('yesterday')) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday.toISOString().split('T')[0];
        } else if (match[1]) {
          const daysAgo = parseInt(match[1]);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          return date.toISOString().split('T')[0];
        }
      }
    }
    return null;
  }

  private extractRequirements(snippet: string, keywords: string): string[] {
    const requirements = [keywords];
    
    // Common tech requirements
    const techPatterns = [
      /\b(JavaScript|TypeScript|React|Node\.js|Python|Java|C\#|SQL|MongoDB|PostgreSQL|AWS|Azure|Docker|Kubernetes)\b/gi,
      /\b(\d+\+?\s*years?\s+experience)\b/gi,
      /\b(bachelor|degree|university|college)\b/gi,
      /\b(english|hebrew|arabic)\b/gi
    ];

    techPatterns.forEach(pattern => {
      const matches = snippet.match(pattern);
      if (matches) {
        requirements.push(...matches.slice(0, 3)); // Limit to avoid spam
      }
    });

    return requirements.slice(0, 8); // Max 8 requirements
  }

  private extractKeywords(snippet: string): string[] {
    const keywords: string[] = [];
    
    // Extract tech keywords
    const techKeywords = snippet.match(/\b(JavaScript|TypeScript|React|Vue|Angular|Node|Python|Java|C\#|PHP|Ruby|Go|Rust|SQL|NoSQL|MongoDB|PostgreSQL|Redis|AWS|Azure|GCP|Docker|Kubernetes|Git|API|REST|GraphQL|Microservices|DevOps|CI\/CD|Agile|Scrum)\b/gi);
    
    if (techKeywords) {
      keywords.push(...techKeywords.slice(0, 5));
    }
    
    return keywords.map(k => k.toLowerCase());
  }

  private extractBenefits(snippet: string): string[] {
    const benefits: string[] = [];
    
    const benefitPatterns = [
      /\b(health\s+insurance|medical|dental|vision)\b/gi,
      /\b(vacation|PTO|paid\s+time\s+off)\b/gi,
      /\b(401k|pension|retirement)\b/gi,
      /\b(stock\s+options|equity|RSU)\b/gi,
      /\b(remote|work\s+from\s+home|flexible\s+hours)\b/gi,
      /\b(professional\s+development|training|education)\b/gi
    ];

    benefitPatterns.forEach(pattern => {
      const matches = snippet.match(pattern);
      if (matches) {
        benefits.push(...matches.slice(0, 2));
      }
    });

    return benefits.slice(0, 5);
  }

  private cleanUrl(url: string): string {
    // Remove Google redirect URLs and clean up the link
    if (!url) return '#';
    
    try {
      // Remove Google redirect parameters
      const cleanedUrl = url.replace(/^https?:\/\/www\.google\.com\/url\?q=/, '');
      
      // Decode URL if it's encoded
      const decodedUrl = decodeURIComponent(cleanedUrl.split('&')[0]);
      
      // Ensure it's a valid HTTP/HTTPS URL
      if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
        return `https://${decodedUrl}`;
      }
      
      // If it's a job site, try to make it more specific
      if (decodedUrl.includes('linkedin.com/jobs/view/')) {
        return decodedUrl; // LinkedIn job links are usually direct
      }
      
      if (decodedUrl.includes('indeed.com')) {
        return decodedUrl; // Indeed links are usually direct
      }
      
      if (decodedUrl.includes('glassdoor.com')) {
        return decodedUrl; // Glassdoor links are usually direct
      }
      
      // For Israeli job sites
      if (decodedUrl.includes('alljobs.co.il') || 
          decodedUrl.includes('drushim.co.il') || 
          decodedUrl.includes('jobmaster.co.il')) {
        return decodedUrl;
      }
      
      return decodedUrl;
    } catch (error) {
      console.warn('Error cleaning URL:', url, error);
      return url; // Return original URL if cleaning fails
    }
  }


}