interface JobSite {
  id: string;
  name: string;
  url: string;
  description: string;
  location: string;
  category: string;
  featured?: boolean;
  stats: {
    avgJobsPosted: string;
    industries: string;
    established: string;
  };
}

interface JobSitesResponse {
  success: boolean;
  data: {
    sites: JobSite[];
    totalCount: number;
  };
  message?: string;
}

export class JobSitesService {
  private jobSites: JobSite[];

  constructor() {
    this.jobSites = [
      // Israeli Job Sites
      {
        id: 'alljobs',
        name: 'AllJobs.co.il',
        url: 'https://www.alljobs.co.il/',
        description: 'Israel\'s leading job search platform with thousands of positions across all industries and experience levels.',
        location: 'Israel',
        category: 'General Jobs',
        featured: true,
        stats: {
          avgJobsPosted: '500+ daily',
          industries: 'All Industries',
          established: '1998'
        }
      },
      {
        id: 'drushim',
        name: 'Drushim.co.il',
        url: 'https://www.drushim.co.il/',
        description: 'One of Israel\'s most popular job boards offering comprehensive career opportunities and recruitment services.',
        location: 'Israel',
        category: 'General Jobs',
        featured: true,
        stats: {
          avgJobsPosted: '400+ daily',
          industries: 'All Industries',
          established: '1999'
        }
      },
      {
        id: 'jobmaster',
        name: 'JobMaster.co.il',
        url: 'https://www.jobmaster.co.il/',
        description: 'Professional job matching platform connecting talented individuals with top Israeli companies.',
        location: 'Israel',
        category: 'General Jobs',
        stats: {
          avgJobsPosted: '200+ daily',
          industries: 'Professional Services',
          established: '2005'
        }
      },
      {
        id: 'gotfriends',
        name: 'Got Friends',
        url: 'https://www.gotfriends.co.il/',
        description: 'Tech-focused recruitment platform specializing in high-tech positions and startup opportunities in Israel.',
        location: 'Israel',
        category: 'Tech Jobs',
        featured: true,
        stats: {
          avgJobsPosted: '150+ daily',
          industries: 'High-Tech, Startups',
          established: '2010'
        }
      },
      {
        id: 'talpiot',
        name: 'Talpiot.co.il',
        url: 'https://www.talpiot.co.il/',
        description: 'Premium executive and managerial positions platform for senior-level professionals in Israel.',
        location: 'Israel',
        category: 'Executive Jobs',
        stats: {
          avgJobsPosted: '50+ daily',
          industries: 'Management, Executive',
          established: '2003'
        }
      },

      // International Job Sites
      {
        id: 'linkedin',
        name: 'LinkedIn Jobs',
        url: 'https://www.linkedin.com/jobs/',
        description: 'Global professional network with extensive job opportunities across all industries worldwide.',
        location: 'Global',
        category: 'Professional Network',
        featured: true,
        stats: {
          avgJobsPosted: '10,000+ daily',
          industries: 'All Industries',
          established: '2003'
        }
      },
      {
        id: 'indeed',
        name: 'Indeed',
        url: 'https://www.indeed.com/',
        description: 'World\'s largest job search engine aggregating millions of job listings from thousands of websites.',
        location: 'Global',
        category: 'Job Aggregator',
        featured: true,
        stats: {
          avgJobsPosted: '50,000+ daily',
          industries: 'All Industries',
          established: '2004'
        }
      },
      {
        id: 'glassdoor',
        name: 'Glassdoor',
        url: 'https://www.glassdoor.com/Jobs/',
        description: 'Comprehensive platform offering job listings, company reviews, salary information, and interview insights.',
        location: 'Global',
        category: 'Company Intelligence',
        stats: {
          avgJobsPosted: '5,000+ daily',
          industries: 'All Industries',
          established: '2007'
        }
      },
      {
        id: 'monster',
        name: 'Monster',
        url: 'https://www.monster.com/',
        description: 'Pioneer in online job searching with career advice, resume services, and global job opportunities.',
        location: 'Global',
        category: 'General Jobs',
        stats: {
          avgJobsPosted: '2,000+ daily',
          industries: 'All Industries',
          established: '1994'
        }
      },
      {
        id: 'ziprecruiter',
        name: 'ZipRecruiter',
        url: 'https://www.ziprecruiter.com/',
        description: 'AI-powered job matching platform connecting job seekers with employers efficiently.',
        location: 'Global',
        category: 'AI-Powered Matching',
        stats: {
          avgJobsPosted: '3,000+ daily',
          industries: 'All Industries',
          established: '2010'
        }
      },

      // Tech-Specific Job Sites
      {
        id: 'stackoverflow',
        name: 'Stack Overflow Jobs',
        url: 'https://stackoverflow.com/jobs/',
        description: 'Developer-focused job board from the world\'s largest programming community.',
        location: 'Global',
        category: 'Tech Jobs',
        featured: true,
        stats: {
          avgJobsPosted: '500+ daily',
          industries: 'Software Development',
          established: '2015'
        }
      },
      {
        id: 'github',
        name: 'GitHub Jobs',
        url: 'https://github.com/jobs/',
        description: 'Tech jobs platform integrated with GitHub\'s developer ecosystem.',
        location: 'Global',
        category: 'Tech Jobs',
        stats: {
          avgJobsPosted: '200+ daily',
          industries: 'Software Development',
          established: '2013'
        }
      },
      {
        id: 'dice',
        name: 'Dice',
        url: 'https://www.dice.com/',
        description: 'Leading tech career hub for IT professionals and technology companies.',
        location: 'Global',
        category: 'Tech Jobs',
        stats: {
          avgJobsPosted: '1,000+ daily',
          industries: 'Technology, IT',
          established: '1990'
        }
      },
      {
        id: 'angel',
        name: 'AngelList',
        url: 'https://angel.co/jobs/',
        description: 'Startup-focused platform connecting talent with innovative companies and investment opportunities.',
        location: 'Global',
        category: 'Startup Jobs',
        stats: {
          avgJobsPosted: '300+ daily',
          industries: 'Startups, Tech',
          established: '2010'
        }
      },

      // Remote Work Platforms
      {
        id: 'remote',
        name: 'Remote.co',
        url: 'https://remote.co/',
        description: 'Curated remote job listings across various industries for location-independent professionals.',
        location: 'Remote',
        category: 'Remote Jobs',
        featured: true,
        stats: {
          avgJobsPosted: '100+ daily',
          industries: 'All Industries',
          established: '2014'
        }
      },
      {
        id: 'weworkremotely',
        name: 'We Work Remotely',
        url: 'https://weworkremotely.com/',
        description: 'World\'s largest remote work community with quality remote job opportunities.',
        location: 'Remote',
        category: 'Remote Jobs',
        stats: {
          avgJobsPosted: '200+ daily',
          industries: 'Tech, Marketing, Customer Support',
          established: '2013'
        }
      },
      {
        id: 'flexjobs',
        name: 'FlexJobs',
        url: 'https://www.flexjobs.com/',
        description: 'Premium service offering flexible, remote, and part-time job opportunities.',
        location: 'Remote',
        category: 'Flexible Jobs',
        stats: {
          avgJobsPosted: '150+ daily',
          industries: 'All Industries',
          established: '2007'
        }
      },

      // Freelance Platforms
      {
        id: 'upwork',
        name: 'Upwork',
        url: 'https://www.upwork.com/',
        description: 'Global freelancing platform connecting businesses with independent professionals.',
        location: 'Global',
        category: 'Freelance',
        stats: {
          avgJobsPosted: '5,000+ daily',
          industries: 'All Industries',
          established: '2015'
        }
      },
      {
        id: 'freelancer',
        name: 'Freelancer.com',
        url: 'https://www.freelancer.com/',
        description: 'Marketplace for freelance services across programming, design, writing, and more.',
        location: 'Global',
        category: 'Freelance',
        stats: {
          avgJobsPosted: '3,000+ daily',
          industries: 'All Industries',
          established: '2009'
        }
      },
      {
        id: 'fiverr',
        name: 'Fiverr',
        url: 'https://www.fiverr.com/',
        description: 'Digital services marketplace where freelancers offer services starting at $5.',
        location: 'Global',
        category: 'Freelance',
        stats: {
          avgJobsPosted: '2,000+ daily',
          industries: 'Digital Services',
          established: '2010'
        }
      }
    ];
  }

  async getAllSites(): Promise<JobSitesResponse> {
    try {
      return {
        success: true,
        data: {
          sites: this.jobSites,
          totalCount: this.jobSites.length
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          sites: [],
          totalCount: 0
        },
        message: 'Failed to fetch job sites'
      };
    }
  }

  async getSiteById(id: string): Promise<{ success: boolean; data?: JobSite; message?: string }> {
    try {
      const site = this.jobSites.find(site => site.id === id);
      if (site) {
        return {
          success: true,
          data: site
        };
      } else {
        return {
          success: false,
          message: 'Job site not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch job site'
      };
    }
  }

  async getSitesByCategory(category: string): Promise<JobSitesResponse> {
    try {
      const filteredSites = this.jobSites.filter(site => 
        site.category.toLowerCase().includes(category.toLowerCase())
      );
      
      return {
        success: true,
        data: {
          sites: filteredSites,
          totalCount: filteredSites.length
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          sites: [],
          totalCount: 0
        },
        message: 'Failed to filter job sites by category'
      };
    }
  }

  async getFeaturedSites(): Promise<JobSitesResponse> {
    try {
      const featuredSites = this.jobSites.filter(site => site.featured);
      
      return {
        success: true,
        data: {
          sites: featuredSites,
          totalCount: featuredSites.length
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          sites: [],
          totalCount: 0
        },
        message: 'Failed to fetch featured job sites'
      };
    }
  }
}