import axios from 'axios';
import { PAGINATION_CONSTANTS, GOOGLE_API_CONSTANTS } from '../constants/pagination';

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
  private get apiKey(): string {
    return process.env.GOOGLE_API_KEY || '';
  }
  
  private get searchEngineId(): string {
    return process.env.GOOGLE_SEARCH_ENGINE_ID || '';
  }

  constructor() {
    // Environment variables will be checked at runtime, not construction time
  }

  async searchJobs(keywords: string, location: string = PAGINATION_CONSTANTS.DEFAULT_LOCATION, limit: number = PAGINATION_CONSTANTS.MAX_RESULTS_LIMIT, startIndex: number = 1): Promise<JobSearchResult> {
    console.log(`🔍 Google search for jobs: "${keywords}" in ${location || 'Any location'}`);
    
    try {
      // Build search query
      const searchQuery = this.buildSearchQuery(keywords, location);
      
      // Require API keys - no mock results
      if (!this.apiKey || !this.searchEngineId) {
        throw new Error('Google API keys not configured. Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in your .env file');
      }

      console.log(`🌍 Searching Google with query: "${searchQuery}"`);
      
      // Google API limits to 10 results per request, so we make multiple requests if needed
      const maxPerRequest = GOOGLE_API_CONSTANTS.MAX_RESULTS_PER_REQUEST;
      const totalRequests = Math.ceil(Math.min(limit, PAGINATION_CONSTANTS.MAX_API_RESULTS) / maxPerRequest); // Cap at API results total
      const allResults: GoogleSearchResult[] = [];
      let totalResultsAvailable = 0;

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
          console.error(`❌ Google search request ${requestIndex + 1} error:`, requestError.message);
          // Continue with other requests even if one fails
          break;
        }
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
      if (error.message?.includes('quotaExceeded')) {
        throw new Error('Google API quota exceeded. Please check your API usage limits.');
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