class JobSitesService {
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
        stats: {
          avgJobsPosted: '100+ daily',
          industries: 'High-Tech & Startups',
          established: '2010'
        }
      },
      {
        id: 'ethosia',
        name: 'Ethosia',
        url: 'https://ethosia.co.il/',
        description: 'Professional recruitment consultancy focusing on senior positions and executive roles in Israel.',
        location: 'Israel',
        category: 'Executive Jobs',
        stats: {
          avgJobsPosted: '50+ daily',
          industries: 'Executive & Leadership',
          established: '2012'
        }
      },
      {
        id: 'jobnet',
        name: 'JobNet.co.il',
        url: 'https://www.jobnet.co.il/',
        description: 'Comprehensive Israeli job portal offering positions across multiple industries with advanced search filters.',
        location: 'Israel',
        category: 'General Jobs',
        stats: {
          avgJobsPosted: '300+ daily',
          industries: 'All Industries',
          established: '2003'
        }
      },
      {
        id: 'techit',
        name: 'TechIT.co.il',
        url: 'https://www.techit.co.il/',
        description: 'Israel\'s premier technology job board specializing in software development, DevOps, and IT positions.',
        location: 'Israel',
        category: 'Tech Jobs',
        featured: true,
        stats: {
          avgJobsPosted: '150+ daily',
          industries: 'Technology & IT',
          established: '2008'
        }
      },
      {
        id: 'indeed-il',
        name: 'Indeed Israel',
        url: 'https://il.indeed.com/',
        description: 'Global job search engine with extensive Israeli job listings across all industries and locations.',
        location: 'Israel',
        category: 'General Jobs',
        stats: {
          avgJobsPosted: '1000+ daily',
          industries: 'All Industries',
          established: '2004'
        }
      },
      {
        id: 'misrot',
        name: 'Misrot.com',
        url: 'https://www.misrot.com/',
        description: 'Israeli job platform focusing on career advancement and professional development opportunities.',
        location: 'Israel',
        category: 'General Jobs',
        stats: {
          avgJobsPosted: '250+ daily',
          industries: 'Professional Development',
          established: '2006'
        }
      },
      {
        id: 'dialog',
        name: 'Dialog.co.il',
        url: 'https://www.dialog.co.il/',
        description: 'Professional networking and recruitment platform connecting professionals with career opportunities.',
        location: 'Israel',
        category: 'Professional Network',
        stats: {
          avgJobsPosted: '100+ daily',
          industries: 'Professional Services',
          established: '2007'
        }
      },
      {
        id: 'iai-jobs',
        name: 'IAI Jobs',
        url: 'https://jobs.iai.co.il/jobs/',
        description: 'Israel Aerospace Industries career portal offering positions in aerospace, defense, and high-tech sectors.',
        location: 'Israel',
        category: 'Aerospace & Defense',
        stats: {
          avgJobsPosted: '20+ daily',
          industries: 'Aerospace & Defense',
          established: '1953'
        }
      },

      // International Job Sites
      {
        id: 'glassdoor',
        name: 'Glassdoor',
        url: 'https://www.glassdoor.com/Job/index.htm',
        description: 'Global platform combining job search with company reviews, salary insights, and workplace transparency.',
        location: 'Global',
        category: 'General Jobs',
        featured: true,
        stats: {
          avgJobsPosted: '10,000+ daily',
          industries: 'All Industries',
          established: '2007'
        }
      },
      {
        id: 'google-careers',
        name: 'Google Careers',
        url: 'https://www.google.com/about/careers/applications/',
        description: 'Official Google careers portal featuring opportunities to work on products used by billions worldwide.',
        location: 'Global',
        category: 'Tech Giants',
        featured: true,
        stats: {
          avgJobsPosted: '100+ daily',
          industries: 'Technology & Innovation',
          established: '1998'
        }
      },
      {
        id: 'linkedin-jobs',
        name: 'LinkedIn Jobs',
        url: 'https://www.linkedin.com/jobs/',
        description: 'Professional network\'s job platform with global opportunities, networking features, and career insights.',
        location: 'Global',
        category: 'Professional Network',
        featured: true,
        stats: {
          avgJobsPosted: '15,000+ daily',
          industries: 'All Industries',
          established: '2003'
        }
      }
    ];
  }

  // Get all job sites
  async getAllSites() {
    console.log('📋 Serving job sites directory');
    return {
      success: true,
      data: {
        sites: this.jobSites,
        totalSites: this.jobSites.length,
        categories: this.getCategories(),
        locations: this.getLocations()
      },
      message: 'Job sites retrieved successfully'
    };
  }

  // Get featured job sites
  async getFeaturedSites() {
    const featuredSites = this.jobSites.filter(site => site.featured);
    console.log(`⭐ Serving ${featuredSites.length} featured job sites`);
    return {
      success: true,
      data: {
        sites: featuredSites,
        totalSites: featuredSites.length
      },
      message: 'Featured job sites retrieved successfully'
    };
  }

  // Search job sites
  async searchSites(query, filters = {}) {
    console.log(`🔍 Searching job sites for: "${query}"`);
    
    let filteredSites = [...this.jobSites];

    // Text search
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredSites = filteredSites.filter(site =>
        site.name.toLowerCase().includes(searchTerm) ||
        site.description.toLowerCase().includes(searchTerm) ||
        site.category.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All Categories') {
      filteredSites = filteredSites.filter(site => site.category === filters.category);
    }

    // Location filter
    if (filters.location && filters.location !== 'All Locations') {
      filteredSites = filteredSites.filter(site => site.location === filters.location);
    }

    // Featured filter
    if (filters.featured) {
      filteredSites = filteredSites.filter(site => site.featured);
    }

    console.log(`✅ Found ${filteredSites.length} matching job sites`);
    return {
      success: true,
      data: {
        sites: filteredSites,
        totalSites: filteredSites.length,
        query: query,
        filters: filters
      },
      message: `Found ${filteredSites.length} job sites`
    };
  }

  // Get site by ID
  async getSiteById(siteId) {
    const site = this.jobSites.find(s => s.id === siteId);
    
    if (!site) {
      return {
        success: false,
        message: 'Job site not found'
      };
    }

    console.log(`📋 Serving details for: ${site.name}`);
    return {
      success: true,
      data: { site },
      message: 'Job site details retrieved successfully'
    };
  }

  // Get statistics
  async getStats() {
    const stats = {
      totalSites: this.jobSites.length,
      israeliSites: this.jobSites.filter(s => s.location === 'Israel').length,
      globalSites: this.jobSites.filter(s => s.location === 'Global').length,
      featuredSites: this.jobSites.filter(s => s.featured).length,
      categories: this.getCategories().length,
      topCategories: this.getTopCategories()
    };

    console.log('📊 Serving job sites statistics');
    return {
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully'
    };
  }

  // Helper methods
  getCategories() {
    const categories = [...new Set(this.jobSites.map(site => site.category))];
    return ['All Categories', ...categories];
  }

  getLocations() {
    const locations = [...new Set(this.jobSites.map(site => site.location))];
    return ['All Locations', ...locations];
  }

  getTopCategories() {
    const categoryCount = {};
    this.jobSites.forEach(site => {
      categoryCount[site.category] = (categoryCount[site.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }
}

module.exports = { JobSitesService };