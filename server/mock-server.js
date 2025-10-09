const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing
app.use(cors({
  origin: ["http://localhost:5176", "http://localhost:5173"],
  credentials: true
}));
app.use(express.json());

// Mock job data for testing
const mockJobs = [
  {
    _id: "1",
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    description: "We are looking for an experienced React developer with 3+ years of experience in modern JavaScript frameworks. Must have knowledge of TypeScript, Node.js, and cloud technologies.",
    salaryMin: 90000,
    salaryMax: 130000,
    employmentType: "full-time",
    experienceLevel: "senior",
    datePosted: "2025-10-07",
    url: "https://example.com/job/1",
    source: "TechJobs",
    requirements: ["React", "TypeScript", "JavaScript", "Node.js"],
    keywords: ["React", "Frontend", "JavaScript", "TypeScript"],
    benefits: ["Health Insurance", "Remote Work", "401k"],
    isActive: true,
    scrapedAt: new Date("2025-10-07T10:00:00Z")
  },
  {
    _id: "2", 
    title: "Full Stack JavaScript Developer",
    company: "StartupXYZ",
    location: "Remote",
    description: "Join our dynamic team building cutting-edge web applications. Experience with React, Node.js, Express, and MongoDB required. AWS knowledge is a plus.",
    salaryMin: 75000,
    salaryMax: 110000,
    employmentType: "full-time", 
    experienceLevel: "mid",
    datePosted: "2025-10-07",
    url: "https://example.com/job/2",
    source: "RemoteJobs",
    requirements: ["JavaScript", "React", "Node.js", "Express", "MongoDB"],
    keywords: ["Full Stack", "JavaScript", "React", "Node.js"],
    benefits: ["Remote Work", "Flexible Hours", "Health Insurance"],
    isActive: true,
    scrapedAt: new Date("2025-10-07T09:00:00Z")
  },
  {
    _id: "3",
    title: "Frontend Developer - Vue.js",
    company: "DesignStudio",
    location: "New York, NY", 
    description: "Creative frontend developer needed for exciting projects. Vue.js expertise required along with strong CSS and design skills.",
    salaryMin: 70000,
    salaryMax: 95000,
    employmentType: "full-time",
    experienceLevel: "mid",
    datePosted: "2025-10-06", 
    url: "https://example.com/job/3",
    source: "DesignJobs",
    requirements: ["Vue.js", "JavaScript", "CSS", "HTML"],
    keywords: ["Vue", "Frontend", "CSS", "Design"],
    benefits: ["Creative Environment", "Health Insurance", "Gym Membership"],
    isActive: true,
    scrapedAt: new Date("2025-10-06T14:00:00Z")
  },
  {
    _id: "4",
    title: "Backend Developer - Python",
    company: "DataFlow Solutions",
    location: "Austin, TX",
    description: "Python backend developer for data-intensive applications. Experience with Django, PostgreSQL, and REST API development required.",
    salaryMin: 80000,
    salaryMax: 115000,
    employmentType: "full-time",
    experienceLevel: "senior",
    datePosted: "2025-10-06",
    url: "https://example.com/job/4", 
    source: "TechCareers",
    requirements: ["Python", "Django", "PostgreSQL", "REST API"],
    keywords: ["Python", "Backend", "Django", "Database"],
    benefits: ["Health Insurance", "Remote Work", "Professional Development"],
    isActive: true,
    scrapedAt: new Date("2025-10-06T11:00:00Z")
  },
  {
    _id: "5",
    title: "DevOps Engineer",
    company: "CloudFirst Technologies", 
    location: "Seattle, WA",
    description: "DevOps engineer to manage cloud infrastructure and CI/CD pipelines. AWS, Docker, and Kubernetes experience required.",
    salaryMin: 95000,
    salaryMax: 140000,
    employmentType: "full-time",
    experienceLevel: "senior", 
    datePosted: "2025-10-05",
    url: "https://example.com/job/5",
    source: "CloudJobs",
    requirements: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    keywords: ["DevOps", "AWS", "Docker", "Cloud"],
    benefits: ["Health Insurance", "Stock Options", "Flexible Hours"],
    isActive: true,
    scrapedAt: new Date("2025-10-05T16:00:00Z")
  }
];

// GET /api/jobs - Search jobs
app.get("/api/jobs", (req, res) => {
  try {
    const { 
      keywords = "", 
      location = "", 
      employmentType = "",
      experienceLevel = "",
      page = 1,
      limit = 20 
    } = req.query;

    console.log(`🔍 Job search request: keywords="${keywords}", location="${location}"`);

    let filteredJobs = [...mockJobs];

    // Filter by keywords
    if (keywords && keywords.toString().trim()) {
      const searchTerms = keywords.toString().toLowerCase().split(' ');
      filteredJobs = filteredJobs.filter(job => 
        searchTerms.some(term => 
          job.title.toLowerCase().includes(term) ||
          job.description.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.requirements.some(req => req.toLowerCase().includes(term)) ||
          job.keywords.some(kw => kw.toLowerCase().includes(term))
        )
      );
    }

    // Filter by location
    if (location && location.toString().trim()) {
      const locationTerm = location.toString().toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationTerm)
      );
    }

    // Filter by employment type
    if (employmentType && employmentType.toString().trim()) {
      filteredJobs = filteredJobs.filter(job => 
        job.employmentType === employmentType.toString()
      );
    }

    // Filter by experience level
    if (experienceLevel && experienceLevel.toString().trim()) {
      filteredJobs = filteredJobs.filter(job => 
        job.experienceLevel === experienceLevel.toString()
      );
    }

    const pageNum = parseInt(page.toString()) || 1;
    const limitNum = parseInt(limit.toString()) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limitNum);

    const response = {
      jobs: paginatedJobs,
      totalCount: filteredJobs.length,
      page: pageNum,
      totalPages: Math.ceil(filteredJobs.length / limitNum),
      filters: {
        sources: [...new Set(mockJobs.map(job => job.source))],
        locations: [...new Set(mockJobs.map(job => job.location))],
        companies: [...new Set(mockJobs.map(job => job.company))],
        employmentTypes: [...new Set(mockJobs.map(job => job.employmentType))]
      }
    };

    console.log(`✅ Found ${filteredJobs.length} jobs, returning page ${pageNum}`);
    
    res.json({
      success: true,
      data: response,
      message: `Found ${filteredJobs.length} jobs matching your criteria`
    });

  } catch (error) {
    console.error('❌ Error in job search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search jobs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/jobs/stats/overview - Job statistics
app.get("/api/jobs/stats/overview", (req, res) => {
  try {
    const stats = {
      totalJobs: mockJobs.length,
      activeJobs: mockJobs.filter(job => job.isActive).length,
      companiesCount: new Set(mockJobs.map(job => job.company)).size,
      newJobsThisWeek: mockJobs.filter(job => {
        const jobDate = new Date(job.scrapedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return jobDate >= weekAgo;
      }).length,
      averageSalary: Math.round(
        mockJobs.reduce((sum, job) => sum + (job.salaryMin + job.salaryMax) / 2, 0) / mockJobs.length
      ),
      topSkills: ["JavaScript", "React", "Node.js", "TypeScript", "Python"],
      topLocations: ["San Francisco, CA", "New York, NY", "Remote", "Austin, TX", "Seattle, WA"],
      experienceLevels: {
        entry: mockJobs.filter(job => job.experienceLevel === 'entry').length,
        mid: mockJobs.filter(job => job.experienceLevel === 'mid').length,
        senior: mockJobs.filter(job => job.experienceLevel === 'senior').length
      }
    };

    res.json({
      success: true,
      data: stats,
      message: 'Job statistics retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job statistics'
    });
  }
});

// GET /api/jobs/:id - Get specific job
app.get("/api/jobs/:id", (req, res) => {
  try {
    const { id } = req.params;
    const job = mockJobs.find(j => j._id === id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job,
      message: 'Job retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error getting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job'
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "JobPilot Mock Server is running",
    timestamp: new Date().toISOString(),
    jobCount: mockJobs.length
  });
});

// POST /api/jobs/scrape - Mock scraping endpoint
app.post("/api/jobs/scrape", (req, res) => {
  const { keywords } = req.body;
  
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        totalJobs: 3,
        jobsBySite: { "mock-site": 3 },
        errors: []
      },
      message: `Mock scraping completed for "${keywords}". Found 3 new jobs.`
    });
  }, 2000);
});

app.listen(PORT, () => {
  console.log(`🚀 JobPilot Mock Server running on port ${PORT}`);
  console.log(`🎯 API available at: http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Mock jobs loaded: ${mockJobs.length} jobs`);
  console.log(`🌐 Frontend URL: http://localhost:5176`);
  console.log(`\n🎉 Ready for job searches!`);
});