export interface JobSite {
  id: string;
  name: string;
  url: string;
  description: string;
  location: string;
  category: string;
  featured?: boolean;
}

export const JOB_SITES: JobSite[] = [
  // Israeli Job Sites
  {
    id: 'alljobs',
    name: 'AllJobs.co.il',
    url: 'https://www.alljobs.co.il/',
    description: 'Israel\'s leading job search platform with thousands of positions across all industries and experience levels.',
    location: 'Israel',
    category: 'General Jobs',
    featured: true
  },
  {
    id: 'drushim',
    name: 'Drushim.co.il',
    url: 'https://www.drushim.co.il/',
    description: 'One of Israel\'s most popular job boards offering comprehensive career opportunities and recruitment services.',
    location: 'Israel',
    category: 'General Jobs',
    featured: true
  },
  {
    id: 'jobmaster',
    name: 'JobMaster.co.il',
    url: 'https://www.jobmaster.co.il/',
    description: 'Professional job matching platform connecting talented individuals with top Israeli companies.',
    location: 'Israel',
    category: 'General Jobs'
  },
  {
    id: 'gotfriends',
    name: 'Got Friends',
    url: 'https://www.gotfriends.co.il/',
    description: 'Tech-focused recruitment platform specializing in high-tech positions and startup opportunities in Israel.',
    location: 'Israel',
    category: 'Tech Jobs'
  },
  {
    id: 'ethosia',
    name: 'Ethosia',
    url: 'https://ethosia.co.il/',
    description: 'Professional recruitment consultancy focusing on senior positions and executive roles in Israel.',
    location: 'Israel',
    category: 'Executive Jobs'
  },
  {
    id: 'jobnet',
    name: 'JobNet.co.il',
    url: 'https://www.jobnet.co.il/',
    description: 'Comprehensive Israeli job portal offering positions across multiple industries with advanced search filters.',
    location: 'Israel',
    category: 'General Jobs'
  },
  {
    id: 'techit',
    name: 'TechIT.co.il',
    url: 'https://www.techit.co.il/',
    description: 'Israel\'s premier technology job board specializing in software development, DevOps, and IT positions.',
    location: 'Israel',
    category: 'Tech Jobs',
    featured: true
  },
  {
    id: 'indeed-il',
    name: 'Indeed Israel',
    url: 'https://il.indeed.com/',
    description: 'Global job search engine with extensive Israeli job listings across all industries and locations.',
    location: 'Israel',
    category: 'General Jobs'
  },
  {
    id: 'misrot',
    name: 'Misrot.com',
    url: 'https://www.misrot.com/',
    description: 'Israeli job platform focusing on career advancement and professional development opportunities.',
    location: 'Israel',
    category: 'General Jobs'
  },
  {
    id: 'dialog',
    name: 'Dialog.co.il',
    url: 'https://www.dialog.co.il/',
    description: 'Professional networking and recruitment platform connecting professionals with career opportunities.',
    location: 'Israel',
    category: 'Professional Network'
  },
  {
    id: 'iai-jobs',
    name: 'IAI Jobs',
    url: 'https://jobs.iai.co.il/jobs/',
    description: 'Israel Aerospace Industries career portal offering positions in aerospace, defense, and high-tech sectors.',
    location: 'Israel',
    category: 'Aerospace & Defense'
  },

  // International Job Sites
  {
    id: 'glassdoor',
    name: 'Glassdoor',
    url: 'https://www.glassdoor.com/Job/index.htm',
    description: 'Global platform combining job search with company reviews, salary insights, and workplace transparency.',
    location: 'Global',
    category: 'General Jobs',
    featured: true
  },
  {
    id: 'google-careers',
    name: 'Google Careers',
    url: 'https://www.google.com/about/careers/applications/',
    description: 'Official Google careers portal featuring opportunities to work on products used by billions worldwide.',
    location: 'Global',
    category: 'Tech Giants',
    featured: true
  },
  {
    id: 'linkedin-jobs',
    name: 'LinkedIn Jobs',
    url: 'https://www.linkedin.com/jobs/',
    description: 'Professional network\'s job platform with global opportunities, networking features, and career insights.',
    location: 'Global',
    category: 'Professional Network',
    featured: true
  }
];

// Categories for filtering
export const JOB_CATEGORIES = [
  'All Categories',
  'General Jobs',
  'Tech Jobs',
  'Tech Giants',
  'Executive Jobs',
  'Professional Network',
  'Aerospace & Defense'
];

// Locations for filtering
export const JOB_LOCATIONS = [
  'All Locations',
  'Israel',
  'Global'
];

// Helper functions
export const getFeaturedSites = () => JOB_SITES.filter(site => site.featured);

export const getSitesByCategory = (category: string) => 
  category === 'All Categories' 
    ? JOB_SITES 
    : JOB_SITES.filter(site => site.category === category);

export const getSitesByLocation = (location: string) => 
  location === 'All Locations' 
    ? JOB_SITES 
    : JOB_SITES.filter(site => site.location === location);

export const searchSites = (query: string) => 
  JOB_SITES.filter(site => 
    site.name.toLowerCase().includes(query.toLowerCase()) ||
    site.description.toLowerCase().includes(query.toLowerCase()) ||
    site.category.toLowerCase().includes(query.toLowerCase())
  );