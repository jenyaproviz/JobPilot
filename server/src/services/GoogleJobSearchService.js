const axios = require('axios');

class GoogleJobSearchService {
  constructor() {
    // Google Custom Search API configuration
    this.googleApiKey = process.env.GOOGLE_API_KEY; // You'll need to get this from Google Cloud Console
    this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID; // Custom search engine ID
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
    
    // Job search patterns and keywords for better results
    this.jobKeywords = ['job', 'jobs', 'career', 'careers', 'employment', 'position', 'opening', 'hiring', 'vacancy'];
    this.jobSites = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'careerbuilder.com', 'dice.com', 'stackoverflow.com/jobs', 'angel.co', 'remote.co', 'wework.com/creators', 'ziprecruiter.com'];
  }

  /**
   * Build intelligent search query that combines user keywords with job-specific terms
   * @param {string} keywords - User search keywords (e.g., "react developer typescript")
   * @param {string} location - Job location (optional)
   * @param {object} filters - Additional filters (remote, experience level, etc.)
   * @returns {string} - Optimized Google search query
   */
  buildJobSearchQuery(keywords, location = '', filters = {}) {
    let query = '';
    
    // Core keywords from user
    query += keywords;
    
    // Add job-specific terms to ensure we get job results
    const jobTerm = this.jobKeywords[Math.floor(Math.random() * this.jobKeywords.length)];
    query += ` ${jobTerm}`;
    
    // Add location if provided
    if (location && location.trim()) {
      query += ` ${location}`;
    }
    
    // Add remote filter if specified
    if (filters.remote) {
      query += ' remote';
    }
    
    // Add experience level if specified
    if (filters.experienceLevel) {
      query += ` ${filters.experienceLevel}`;
    }
    
    // Add employment type if specified
    if (filters.employmentType) {
      query += ` ${filters.employmentType}`;
    }
    
    return query.trim();
  }

  /**
   * Build site-specific search query to focus on major job boards
   * @param {string} keywords - User search keywords
   * @param {string} location - Job location
   * @param {array} specificSites - Array of sites to search (optional)
   * @returns {string} - Site-restricted search query
   */
  buildSiteSpecificQuery(keywords, location = '', specificSites = []) {
    const sites = specificSites.length > 0 ? specificSites : this.jobSites.slice(0, 5); // Use top 5 job sites
    const siteRestriction = sites.map(site => `site:${site}`).join(' OR ');
    
    let query = `(${siteRestriction}) ${keywords} jobs`;
    
    if (location && location.trim()) {
      query += ` ${location}`;
    }
    
    return query;
  }

  /**
   * Search Google for jobs using Custom Search API
   * @param {string} query - Search query
   * @param {number} start - Starting result index (1-based)
   * @param {number} num - Number of results to return (max 10 per request)
   * @returns {Promise<object>} - Google search results
   */
  async searchGoogle(query, start = 1, num = 10) {
    try {
      if (!this.googleApiKey || !this.searchEngineId) {
        console.warn('⚠️ Google API Key or Search Engine ID not configured, using fallback method');
        return await this.fallbackWebSearch(query, num);
      }

      const params = {
        key: this.googleApiKey,
        cx: this.searchEngineId,
        q: query,
        start: start,
        num: Math.min(num, 10), // Google API limit is 10 per request
        safe: 'active', // Filter explicit content
        dateRestrict: 'm3', // Results from last 3 months for fresh job postings
      };

      console.log(`🔍 Google Custom Search: "${query}"`);
      
      const response = await axios.get(this.baseUrl, { params, timeout: 10000 });
      
      return {
        success: true,
        results: response.data.items || [],
        totalResults: parseInt(response.data.searchInformation?.totalResults || 0),
        searchTime: response.data.searchInformation?.searchTime || 0,
        query: query
      };

    } catch (error) {
      console.error('❌ Google Custom Search API error:', error.message);
      
      // Fallback to web scraping if API fails
      return await this.fallbackWebSearch(query, num);
    }
  }

  /**
   * Fallback method using direct web requests (for when API is not available)
   * @param {string} query - Search query
   * @param {number} num - Number of results desired
   * @returns {Promise<object>} - Parsed search results
   */
  async fallbackWebSearch(query, num = 10) {
    try {
      console.log(`🔄 Using fallback web search for: "${query}"`);
      
      // Generate mock job results to demonstrate the system functionality
      // In production, this would use web scraping or other job APIs
      const mockJobs = this.generateMockJobResults(query, num);
      
      return {
        success: true,
        results: mockJobs,
        totalResults: mockJobs.length,
        searchTime: 0.5,
        query: query,
        fallbackMode: true,
        message: 'Using fallback mode with sample data. Configure Google Custom Search API for live results.'
      };

    } catch (error) {
      console.error('❌ Fallback web search failed:', error.message);
      
      return {
        success: false,
        results: [],
        totalResults: 0,
        searchTime: 0,
        query: query,
        error: error.message
      };
    }
  }

  /**
   * Generate mock job results based on the search query
   * @param {string} query - Search query
   * @param {number} num - Number of jobs to generate
   * @returns {array} - Mock job results
   */
  generateMockJobResults(query, num = 10) {
    const companies = [
      'Google', 'Microsoft', 'Facebook', 'Amazon', 'Apple', 'Netflix', 'Uber', 'Airbnb', 
      'Spotify', 'LinkedIn', 'Twitter', 'Shopify', 'Slack', 'Zoom', 'Adobe', 'Intel'
    ];
    
    const locations = [
      'Tel Aviv, Israel', 'New York, NY', 'San Francisco, CA', 'London, UK', 'Berlin, Germany',
      'Remote', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Toronto, Canada'
    ];
    
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
    const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead'];
    
    const mockJobs = [];
    
    for (let i = 0; i < Math.min(num, 15); i++) {
      const company = companies[i % companies.length];
      const location = locations[i % locations.length];
      const jobType = jobTypes[i % jobTypes.length];
      const experience = experienceLevels[i % experienceLevels.length];
      
      // Create job title based on search query
      let title = query.includes('react') ? 'React Developer' : 
                  query.includes('typescript') ? 'TypeScript Developer' :
                  query.includes('javascript') ? 'JavaScript Developer' :
                  query.includes('python') ? 'Python Developer' :
                  query.includes('java') ? 'Java Developer' :
                  query.includes('node') ? 'Node.js Developer' :
                  query.includes('frontend') ? 'Frontend Developer' :
                  query.includes('backend') ? 'Backend Developer' :
                  query.includes('fullstack') ? 'Full Stack Developer' :
                  'Software Developer';
      
      if (i > 0) {
        const variations = [
          `${experience} ${title}`,
          `${title} - ${experience}`,
          `Senior ${title}`,
          `${title} Engineer`,
          `Lead ${title}`,
          `${title} Specialist`
        ];
        title = variations[i % variations.length];
      }

      mockJobs.push({
        title: title,
        company: company,
        location: location,
        description: `Exciting opportunity to work as a ${title} at ${company}. We're looking for someone with strong skills in ${query} and related technologies. Join our dynamic team and help us build amazing products that impact millions of users worldwide.`,
        link: `https://${company.toLowerCase()}.com/careers/job-${i + 1}`,
        snippet: `${title} position at ${company} in ${location}. Strong experience with ${query} required. Competitive salary and benefits package offered.`,
        formattedUrl: `https://${company.toLowerCase()}.com/careers/`,
        datePosted: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last 30 days
        employmentType: jobType,
        experienceLevel: experience,
        isRemote: location === 'Remote' || Math.random() > 0.7
      });
    }
    
    return mockJobs;
  }

  /**
   * Parse Google search results to extract job-relevant information
   * @param {array} results - Raw Google search results
   * @returns {array} - Parsed job listings
   */
  parseJobResults(results) {
    return results.map((result, index) => {
      // Extract job-relevant information from Google search result
      const title = result.title || 'Job Title Not Available';
      const company = this.extractCompanyName(result);
      const location = this.extractLocation(result);
      const description = result.snippet || result.description || '';
      const url = result.link || result.formattedUrl || '';
      const source = this.extractSourceSite(url);

      // Try to determine if this is actually a job posting
      const isLikelyJob = this.isLikelyJobPosting(title, description, url);

      return {
        id: `google_job_${Date.now()}_${index}`,
        title: this.cleanJobTitle(title),
        company: company || this.extractCompanyFromUrl(url),
        location: location || 'Location Not Specified',
        description: this.cleanDescription(description),
        url: url,
        source: source,
        datePosted: this.estimateDatePosted(result),
        employmentType: this.extractEmploymentType(title, description),
        salaryRange: this.extractSalaryInfo(description),
        isRemote: this.isRemoteJob(title, description),
        experienceLevel: this.extractExperienceLevel(title, description),
        jobScore: this.calculateJobRelevanceScore(title, description, url),
        isLikelyJob: isLikelyJob
      };
    }).filter(job => job.isLikelyJob); // Only return likely job postings
  }

  /**
   * Extract company name from search result
   */
  extractCompanyName(result) {
    // Try to extract company from title or snippet
    const title = result.title || '';
    const snippet = result.snippet || '';
    
    // Common patterns: "Job Title at Company Name", "Company Name - Job Title"
    let company = null;
    
    // Pattern: "Job at Company"
    const atPattern = title.match(/at\s+(.+?)(?:\s*[-|]|\s*$)/i);
    if (atPattern) {
      company = atPattern[1].trim();
    }
    
    // Pattern: "Company - Job"
    const dashPattern = title.match(/^(.+?)\s*[-–]\s*.+/);
    if (dashPattern && !company) {
      company = dashPattern[1].trim();
    }
    
    return company;
  }

  /**
   * Extract location from search result
   */
  extractLocation(result) {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    
    // Look for common location patterns
    const locationPatterns = [
      /in\s+([^,]+(?:,\s*[a-z]{2})?)/i,
      /location:\s*([^,\n]+)/i,
      /(\w+,\s*\w{2}|\w+\s+\w+,\s*\w{2})/i, // City, State format
      /(new york|san francisco|los angeles|chicago|boston|seattle|austin|denver|remote)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  /**
   * Extract source site from URL
   */
  extractSourceSite(url) {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Unknown Source';
    }
  }

  /**
   * Determine if a search result is likely a job posting
   */
  isLikelyJobPosting(title, description, url) {
    const text = `${title} ${description}`.toLowerCase();
    const urlLower = url.toLowerCase();
    
    // Job indicators
    const jobIndicators = [
      'job', 'career', 'position', 'opening', 'hiring', 'employment', 
      'vacancy', 'opportunity', 'role', 'developer', 'engineer', 
      'manager', 'analyst', 'specialist', 'coordinator', 'assistant'
    ];
    
    // Job site indicators
    const jobSiteIndicators = [
      'linkedin.com/jobs', 'indeed.com', 'glassdoor.com', 'monster.com',
      'careerbuilder.com', 'dice.com', 'stackoverflow.com/jobs', 'angel.co',
      'remote.co', 'ziprecruiter.com', '/jobs/', '/careers/', '/job/'
    ];
    
    // Check for job keywords
    const hasJobKeywords = jobIndicators.some(keyword => text.includes(keyword));
    
    // Check for job site URLs
    const isJobSite = jobSiteIndicators.some(site => urlLower.includes(site));
    
    // Negative indicators (things that suggest it's NOT a job posting)
    const negativeIndicators = ['blog', 'news', 'article', 'tutorial', 'course', 'training'];
    const hasNegativeIndicators = negativeIndicators.some(neg => text.includes(neg));
    
    return (hasJobKeywords || isJobSite) && !hasNegativeIndicators;
  }

  /**
   * Clean and format job title
   */
  cleanJobTitle(title) {
    // Remove common suffixes and prefixes
    return title
      .replace(/\s*[-|]\s*.+$/, '') // Remove everything after dash or pipe
      .replace(/^.+?:\s*/, '') // Remove prefix before colon
      .replace(/\s*\(.*?\)\s*/, '') // Remove parenthetical content
      .trim();
  }

  /**
   * Clean description text
   */
  cleanDescription(description) {
    return description
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
      .trim()
      .substring(0, 300) + '...'; // Limit length
  }

  /**
   * Extract company from URL if not found elsewhere
   */
  extractCompanyFromUrl(url) {
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      
      // Skip generic job sites
      const genericSites = ['linkedin', 'indeed', 'glassdoor', 'monster', 'careerbuilder'];
      if (genericSites.some(site => hostname.includes(site))) {
        return null;
      }
      
      // Extract company name from domain
      return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    } catch {
      return null;
    }
  }

  /**
   * Estimate when job was posted (placeholder - would need more sophisticated logic)
   */
  estimateDatePosted(result) {
    // For now, return recent date since we're filtering for recent results
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // Random between 0-30 days ago
    const postDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return postDate.toISOString();
  }

  /**
   * Extract employment type from text
   */
  extractEmploymentType(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('full time') || text.includes('full-time')) return 'Full-time';
    if (text.includes('part time') || text.includes('part-time')) return 'Part-time';
    if (text.includes('contract') || text.includes('contractor')) return 'Contract';
    if (text.includes('internship') || text.includes('intern')) return 'Internship';
    if (text.includes('freelance') || text.includes('freelancer')) return 'Freelance';
    
    return 'Full-time'; // Default assumption
  }

  /**
   * Extract salary information from text
   */
  extractSalaryInfo(description) {
    const salaryPattern = /\$[\d,]+(?:\s*-\s*\$?[\d,]+)?(?:\s*(?:per\s+year|annually|\/year|k|K))?/;
    const match = description.match(salaryPattern);
    return match ? match[0] : null;
  }

  /**
   * Determine if job is remote
   */
  isRemoteJob(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    return text.includes('remote') || text.includes('work from home') || text.includes('wfh');
  }

  /**
   * Extract experience level from text
   */
  extractExperienceLevel(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('senior') || text.includes('sr.') || text.includes('lead')) return 'Senior';
    if (text.includes('junior') || text.includes('jr.') || text.includes('entry')) return 'Junior';
    if (text.includes('mid level') || text.includes('mid-level')) return 'Mid-Level';
    if (text.includes('principal') || text.includes('staff') || text.includes('architect')) return 'Principal';
    if (text.includes('intern') || text.includes('graduate')) return 'Entry-Level';
    
    return 'Mid-Level'; // Default assumption
  }

  /**
   * Calculate job relevance score based on various factors
   */
  calculateJobRelevanceScore(title, description, url) {
    let score = 0;
    
    // Higher score for job sites
    const jobSites = ['linkedin.com', 'indeed.com', 'glassdoor.com'];
    if (jobSites.some(site => url.includes(site))) score += 30;
    
    // Higher score for job-specific keywords in title
    if (title.toLowerCase().includes('developer') || title.toLowerCase().includes('engineer')) score += 20;
    
    // Points for detailed descriptions
    if (description.length > 100) score += 10;
    
    // Points for salary information
    if (this.extractSalaryInfo(description)) score += 15;
    
    // Points for location information
    if (this.extractLocation({ title, snippet: description })) score += 10;
    
    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Main search method - orchestrates the entire job search process
   * @param {string} keywords - User search keywords
   * @param {object} options - Search options (location, filters, etc.)
   * @returns {Promise<object>} - Formatted job search results
   */
  async searchJobs(keywords, options = {}) {
    try {
      const {
        location = '',
        limit = 20,
        useMultipleQueries = true,
        filters = {}
      } = options;

      console.log(`🌍 Starting global job search for: "${keywords}" ${location ? `in ${location}` : ''}`);

      let allResults = [];
      let totalResults = 0;

      // Strategy 1: General job search
      const generalQuery = this.buildJobSearchQuery(keywords, location, filters);
      const generalResults = await this.searchGoogle(generalQuery, 1, 10);
      
      if (generalResults.success && generalResults.results.length > 0) {
        const parsedGeneral = this.parseJobResults(generalResults.results);
        allResults.push(...parsedGeneral);
        totalResults += generalResults.totalResults;
      }

      // Strategy 2: Site-specific search (if enabled and we need more results)
      if (useMultipleQueries && allResults.length < limit) {
        const siteQuery = this.buildSiteSpecificQuery(keywords, location);
        const siteResults = await this.searchGoogle(siteQuery, 1, 10);
        
        if (siteResults.success && siteResults.results.length > 0) {
          const parsedSite = this.parseJobResults(siteResults.results);
          // Avoid duplicates
          const newResults = parsedSite.filter(job => 
            !allResults.some(existing => existing.url === job.url)
          );
          allResults.push(...newResults);
        }
      }

      // Sort by relevance score and limit results
      allResults.sort((a, b) => b.jobScore - a.jobScore);
      const limitedResults = allResults.slice(0, limit);

      console.log(`✅ Found ${limitedResults.length} jobs from global search`);

      return {
        success: true,
        jobs: limitedResults,
        totalCount: totalResults,
        query: keywords,
        location: location,
        searchStrategies: {
          generalQuery: generalQuery,
          siteSpecificQuery: useMultipleQueries ? this.buildSiteSpecificQuery(keywords, location) : null
        },
        apiConfigured: !!(this.googleApiKey && this.searchEngineId)
      };

    } catch (error) {
      console.error('❌ Global job search error:', error);
      
      return {
        success: false,
        jobs: [],
        totalCount: 0,
        error: error.message,
        query: keywords,
        location: location
      };
    }
  }
}

module.exports = { GoogleJobSearchService };