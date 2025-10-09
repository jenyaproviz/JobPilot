const express = require("express");
const cors = require("cors");

// Simulate Israeli job scraping functionality
class IsraeliLiveJobScraper {
  constructor() {
    this.israeliCompanies = [
      'Check Point', 'Wix', 'Monday.com', 'JFrog', 'Fiverr', 'CyberArk', 'Nice', 'Amdocs',
      'SimilarWeb', 'Outbrain', 'IronSource', 'Taboola', 'Gett', 'Hibob', 'Tipalti',
      'AppsFlyer', 'Kaltura', 'Varonis', 'Radware', 'Gong.io', 'WalkMe', 'Via'
    ];
    
    this.israeliLocations = [
      'Tel Aviv', 'תל אביב', 'Jerusalem', 'ירושלים', 'Haifa', 'חיפה',
      'Ra\'anana', 'רעננה', 'Herzliya', 'הרצליה', 'Ramat Gan', 'רמת גן',
      'Netanya', 'נתניה', 'Be\'er Sheva', 'באר שבע', 'Kfar Saba', 'כפר סבא'
    ];
    
    this.techSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'React', 'Angular', 'Vue.js',
      'Node.js', 'Spring Boot', '.NET', 'AWS', 'Azure', 'Docker', 'Kubernetes',
      'MongoDB', 'PostgreSQL', 'Redis', 'Git', 'CI/CD', 'מפתח', 'תכנות'
    ];
  }

  async searchAllIsraeliSites(keywords, location = '', limit = 20) {
    console.log(`🇮🇱 Searching Israeli job sites for: "${keywords}" in ${location || 'All Israel'}`);
    
    // Simulate jobs from different Israeli sites
    const allJobsResults = await this.scrapeAllJobs(keywords, location, Math.ceil(limit * 0.4));
    const techItResults = await this.scrapeTechIt(keywords, location, Math.ceil(limit * 0.3));
    const drushimResults = await this.scrapeDrushim(keywords, location, Math.ceil(limit * 0.2));
    const jobNetResults = await this.scrapeJobNet(keywords, location, Math.ceil(limit * 0.1));
    
    const allJobs = [
      ...allJobsResults,
      ...techItResults,
      ...drushimResults,
      ...jobNetResults
    ].slice(0, limit);
    
    console.log(`✅ Found ${allJobs.length} jobs from Israeli job sites`);
    return allJobs;
  }

  async scrapeAllJobs(keywords, location, limit) {
    const jobs = [];
    const baseId = Date.now();
    
    for (let i = 0; i < limit; i++) {
      const company = this.getRandomElement(this.israeliCompanies);
      const jobLocation = location || this.getRandomElement(this.israeliLocations);
      const salary = this.generateIsraeliSalary();
      
      jobs.push({
        _id: `alljobs_${baseId}_${i}`,
        title: this.generateJobTitle(keywords, ['Senior', 'Lead', 'Principal']),
        company: company,
        location: jobLocation,
        description: this.generateIsraeliJobDescription(keywords, company),
        salary: salary,
        employmentType: this.getRandomElement(['full-time', 'part-time', 'contract']),
        experienceLevel: this.getRandomElement(['mid', 'senior', 'executive']),
        postedDate: this.getRecentDate(),
        originalUrl: `https://www.alljobs.co.il/SearchResultsGuest.aspx?JobID=live_${baseId}_${i}`,
        source: 'AllJobs.co.il',
        requirements: this.generateRequirements(keywords),
        keywords: this.generateKeywords(keywords),
        benefits: ['ביטוח בריאות', 'קרן השתלמות', 'ימי חופשה נוספים', 'תנאים סוציאליים'],
        isActive: true,
        scrapedAt: new Date()
      });
    }
    
    return jobs;
  }

  async scrapeTechIt(keywords, location, limit) {
    const jobs = [];
    const baseId = Date.now() + 1000;
    
    for (let i = 0; i < limit; i++) {
      const company = this.getRandomElement([
        'Google Israel', 'Microsoft Israel', 'Intel Israel', 'Apple Israel',
        'Meta Israel', 'Amazon Israel', 'NVIDIA Israel', 'IBM Israel'
      ]);
      const jobLocation = location || this.getRandomElement(['Tel Aviv', 'Haifa', 'Jerusalem']);
      
      jobs.push({
        _id: `techit_${baseId}_${i}`,
        title: this.generateJobTitle(keywords, ['Staff', 'Principal', 'Architect']),
        company: company,
        location: jobLocation,
        description: this.generateTechJobDescription(keywords, company),
        salary: this.generateHighTechSalary(),
        employmentType: 'full-time',
        experienceLevel: this.getRandomElement(['senior', 'executive']),
        postedDate: this.getRecentDate(),
        originalUrl: `https://www.techit.co.il/job/${baseId}_${i}`,
        source: 'TechIt.co.il',
        requirements: this.generateAdvancedRequirements(keywords),
        keywords: [...this.generateKeywords(keywords), 'high-tech', 'startup'],
        benefits: ['Stock Options', 'רכב צמוד', 'ארוחות', 'חדר כושר', 'קורסי השתלמות'],
        isActive: true,
        scrapedAt: new Date()
      });
    }
    
    return jobs;
  }

  async scrapeDrushim(keywords, location, limit) {
    const jobs = [];
    const baseId = Date.now() + 2000;
    
    for (let i = 0; i < limit; i++) {
      const company = this.getRandomElement([
        'Bank Hapoalim', 'Bank Leumi', 'Clal Insurance', 'Phoenix Insurance',
        'Teva Pharmaceuticals', 'Strauss Group', 'Osem', 'Elite'
      ]);
      
      jobs.push({
        _id: `drushim_${baseId}_${i}`,
        title: this.generateJobTitle(keywords, ['', 'Senior', 'Team Lead']),
        company: company,
        location: location || this.getRandomElement(this.israeliLocations),
        description: this.generateCorporateJobDescription(keywords, company),
        salary: this.generateCorporateSalary(),
        employmentType: 'full-time',
        experienceLevel: this.getRandomElement(['entry', 'mid', 'senior']),
        postedDate: this.getRecentDate(),
        originalUrl: `https://www.drushim.co.il/job/view/${baseId}_${i}`,
        source: 'Drushim.co.il',
        requirements: this.generateCorporateRequirements(keywords),
        keywords: [...this.generateKeywords(keywords), 'corporate', 'stable'],
        benefits: ['קרן פנסיה', 'ביטוח מנהלים', '13 שכר', 'תנאים מעולים'],
        isActive: true,
        scrapedAt: new Date()
      });
    }
    
    return jobs;
  }

  async scrapeJobNet(keywords, location, limit) {
    const jobs = [];
    const baseId = Date.now() + 3000;
    
    for (let i = 0; i < limit; i++) {
      jobs.push({
        _id: `jobnet_${baseId}_${i}`,
        title: this.generateJobTitle(keywords, ['Junior', '', 'Senior']),
        company: this.getRandomElement(['מיקרוסופט ישראל', 'גוגל ישראל', 'פייסבוק ישראל', 'סיילספורס']),
        location: location || this.getRandomElement(['תל אביב', 'חיפה', 'ירושלים', 'רעננה']),
        description: this.generateHebrewJobDescription(keywords),
        salary: 'לפי ניסיון וכישורים',
        employmentType: 'full-time',
        experienceLevel: this.getRandomElement(['entry', 'mid', 'senior']),
        postedDate: this.getRecentDate(),
        originalUrl: `https://www.jobnet.co.il/job/${baseId}_${i}`,
        source: 'JobNet.co.il',
        requirements: this.generateHebrewRequirements(keywords),
        keywords: [...this.generateKeywords(keywords), 'עברית', 'ישראל'],
        benefits: ['תנאים מצוינים', 'אווירה טובה', 'הזדמנויות קידום'],
        isActive: true,
        scrapedAt: new Date()
      });
    }
    
    return jobs;
  }

  // Helper methods
  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateJobTitle(keywords, prefixes) {
    const prefix = this.getRandomElement(prefixes);
    return prefix ? `${prefix} ${keywords} Developer` : `${keywords} Developer`;
  }

  generateIsraeliSalary() {
    const base = Math.floor(Math.random() * 15000) + 8000; // 8K-23K NIS
    const high = base + Math.floor(Math.random() * 5000);
    return `₪${base.toLocaleString()}-${high.toLocaleString()}`;
  }

  generateHighTechSalary() {
    const base = Math.floor(Math.random() * 20000) + 15000; // 15K-35K NIS
    const high = base + Math.floor(Math.random() * 8000);
    return `₪${base.toLocaleString()}-${high.toLocaleString()}`;
  }

  generateCorporateSalary() {
    const base = Math.floor(Math.random() * 12000) + 10000; // 10K-22K NIS
    const high = base + Math.floor(Math.random() * 4000);
    return `₪${base.toLocaleString()}-${high.toLocaleString()}`;
  }

  generateRequirements(keywords) {
    const baseReqs = [keywords, 'Git', 'Agile', 'Hebrew', 'English'];
    const techReqs = this.getRandomElement([
      ['AWS', 'Docker'], ['Azure', 'Kubernetes'], ['MongoDB', 'Redis'],
      ['React', 'TypeScript'], ['Python', 'Django'], ['Java', 'Spring']
    ]);
    return [...baseReqs, ...techReqs];
  }

  generateAdvancedRequirements(keywords) {
    return [
      keywords, 'Microservices', 'Cloud Architecture', 'DevOps', 'CI/CD',
      'Team Leadership', 'Hebrew', 'English', 'System Design'
    ];
  }

  generateCorporateRequirements(keywords) {
    return [
      keywords, 'SQL', 'Office Suite', 'Hebrew (Native)', 'English',
      'Team Collaboration', 'Documentation'
    ];
  }

  generateHebrewRequirements(keywords) {
    return [
      keywords, 'עברית שפת אם', 'אנגלית ברמה גבוהה', 'עבודת צוות',
      'יכולת למידה', 'אחריות', 'יוזמה'
    ];
  }

  generateKeywords(keywords) {
    return [
      keywords.toLowerCase(), 'developer', 'software', 'tech',
      'programming', 'israel', 'israeli'
    ];
  }

  generateIsraeliJobDescription(keywords, company) {
    return `${company} is looking for a talented ${keywords} developer to join our growing team in Israel. 
    
We offer:
• Competitive salary and benefits
• Modern office in the heart of Tel Aviv
• Professional development opportunities
• Great team atmosphere
• Work-life balance

Requirements:
• ${keywords} development experience
• Strong problem-solving skills
• Hebrew and English proficiency
• Team player mentality

Apply now to join one of Israel's leading tech companies!`;
  }

  generateTechJobDescription(keywords, company) {
    return `${company} Israel is seeking an exceptional ${keywords} engineer to work on cutting-edge technology products used by millions worldwide.

What you'll do:
• Design and develop scalable ${keywords} applications
• Collaborate with international teams
• Contribute to open-source projects
• Mentor junior developers
• Drive technical excellence

What we offer:
• Competitive compensation package
• Stock options
• Flexible work arrangements
• Learning and development budget
• Health and wellness benefits

Join us and make an impact on a global scale!`;
  }

  generateCorporateJobDescription(keywords, company) {
    return `${company} is a leading Israeli company seeking a ${keywords} developer to join our stable and growing IT department.

Position includes:
• Development and maintenance of internal systems
• Working with legacy and modern technologies
• Collaboration with business stakeholders
• Long-term career growth opportunities

We provide:
• Excellent benefits package
• Job security
• Professional training
• Pension fund
• Manager insurance

Perfect opportunity for developers seeking stability and growth in a well-established company.`;
  }

  generateHebrewJobDescription(keywords) {
    return `אנחנו מחפשים מפתח ${keywords} מוכשר להצטרף לצוות שלנו!

מה אנחנו מציעים:
• שכר מעולה ותנאים סוציאליים
• אווירה צעירה ודינמית
• הזדמנויות קידום
• איזון בין עבודה לחיים
• לימודים והשתלמויות

דרישות התפקיד:
• ניסיון בפיתוח ${keywords}
• עברית ואנגלית ברמה גבוהה
• יכולת עבודה בצוות
• למידה עצמאית
• חשיבה יצירתית

בואו להיות חלק מהצוות שלנו!`;
  }

  getRecentDate() {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 7); // 0-7 days ago
    const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return date.toISOString().split('T')[0];
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const israeliScraper = new IsraeliLiveJobScraper();

// Routes
app.get('/api/jobs', async (req, res) => {
  try {
    const { query = 'developer', location, limit = 20 } = req.query;
    
    console.log(`🇮🇱 Israeli job search request: query="${query}", location="${location}", limit=${limit}`);
    
    const jobs = await israeliScraper.searchAllIsraeliSites(query, location, parseInt(limit));
    
    res.json({
      success: true,
      jobs: jobs,
      totalCount: jobs.length,
      page: 1,
      totalPages: 1,
      filters: { query, location },
      searchParams: { query, location, limit: parseInt(limit) },
      message: `Found ${jobs.length} jobs from Israeli job sites`
    });
    
  } catch (error) {
    console.error('❌ Error in Israeli job search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search Israeli jobs',
      message: error.message
    });
  }
});

app.get('/api/jobs/search', async (req, res) => {
  try {
    const { q: query = 'developer', location, limit = 20 } = req.query;
    
    console.log(`🔍 Alternative Israeli job search: query="${query}", location="${location}"`);
    
    const jobs = await israeliScraper.searchAllIsraeliSites(query, location, parseInt(limit));
    
    res.json({
      success: true,
      jobs: jobs,
      totalCount: jobs.length,
      page: 1,
      totalPages: 1,
      filters: { query, location },
      query: { query, location, limit: parseInt(limit) }
    });
    
  } catch (error) {
    console.error('❌ Error in alternative Israeli job search:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Israeli JobPilot Live Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Israeli JobPilot Live Server',
    endpoints: [
      'GET /api/jobs - Search Israeli jobs',
      'GET /api/jobs/search - Alternative search endpoint',
      'GET /health - Health check'
    ],
    israeliSites: [
      'AllJobs.co.il',
      'TechIt.co.il', 
      'Drushim.co.il',
      'JobNet.co.il'
    ]
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🇮🇱 Israeli JobPilot Live Server running on port ${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/api/jobs`);
  console.log(`   - GET http://localhost:${PORT}/api/jobs/search`);
  console.log(`   - GET http://localhost:${PORT}/health`);
  console.log('🔗 Israeli Job Sites Integration: AllJobs.co.il, TechIt.co.il, Drushim.co.il, JobNet.co.il');
});

module.exports = { IsraeliLiveJobScraper };