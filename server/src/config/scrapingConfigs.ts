import { IScrapingConfig } from '../types/index';

export const defaultScrapingConfigs: IScrapingConfig[] = [
  {
    siteName: 'indeed',
    baseUrl: 'https://indeed.com',
    searchUrl: 'https://indeed.com/jobs?q={keywords}&l={location}',
    selectors: {
      jobCard: '[data-jk]',
      title: 'h2.jobTitle a span',
      company: '.companyName',
      location: '.companyLocation',
      salary: '.salary-snippet',
      description: '.summary',
      link: 'h2.jobTitle a',
      postedDate: '.date'
    },
    isActive: true,
    rateLimit: 10
  },
  {
    siteName: 'glassdoor',
    baseUrl: 'https://glassdoor.com',
    searchUrl: 'https://glassdoor.com/Job/jobs.htm?sc.keyword={keywords}&locT=C&locId={location}',
    selectors: {
      jobCard: '.react-job-listing',
      title: '[data-test="job-title"]',
      company: '[data-test="employer-name"]',
      location: '[data-test="job-location"]',
      salary: '[data-test="detailSalary"]',
      description: '.jobDescriptionContent',
      link: '[data-test="job-link"]'
    },
    isActive: true,
    rateLimit: 8
  },
  {
    siteName: 'linkedin',
    baseUrl: 'https://linkedin.com',
    searchUrl: 'https://linkedin.com/jobs/search?keywords={keywords}&location={location}',
    selectors: {
      jobCard: '.jobs-search__results-list li',
      title: '.base-search-card__title',
      company: '.base-search-card__subtitle',
      location: '.job-search-card__location',
      link: '.base-card__full-link',
      postedDate: '.job-search-card__listdate'
    },
    isActive: true,
    rateLimit: 5 // LinkedIn is stricter
  },
  {
    siteName: 'monster',
    baseUrl: 'https://monster.com',
    searchUrl: 'https://monster.com/jobs/search?q={keywords}&where={location}',
    selectors: {
      jobCard: '.card-content',
      title: '.title a',
      company: '.company .name',
      location: '.location .name',
      salary: '.wage',
      link: '.title a'
    },
    isActive: true,
    rateLimit: 12
  },
  {
    siteName: 'dice',
    baseUrl: 'https://dice.com',
    searchUrl: 'https://dice.com/jobs?q={keywords}&location={location}',
    selectors: {
      jobCard: '[data-cy="search-result-company-card"]',
      title: '[data-cy="search-result-job-title"]',
      company: '[data-cy="search-result-company-name"]',
      location: '[data-cy="search-result-location"]',
      salary: '[data-cy="search-result-salary"]',
      link: '[data-cy="search-result-job-title"]'
    },
    isActive: true,
    rateLimit: 15
  }
];

// Israeli job sites
export const israeliJobConfigs: IScrapingConfig[] = [
  {
    siteName: 'drushim',
    baseUrl: 'https://drushim.co.il',
    searchUrl: 'https://drushim.co.il/jobs/search?q={keywords}&area={location}',
    selectors: {
      jobCard: '.job-item',
      title: '.job-title a',
      company: '.company-name',
      location: '.job-location',
      link: '.job-title a'
    },
    isActive: true,
    rateLimit: 10
  },
  {
    siteName: 'alljobs',
    baseUrl: 'https://alljobs.co.il',
    searchUrl: 'https://alljobs.co.il/SearchResultsGuest.aspx?page=JobSearchResults&position={keywords}&city={location}',
    selectors: {
      jobCard: '.job-item-wrapper',
      title: '.position-name a',
      company: '.company-name',
      location: '.job-location',
      link: '.position-name a'
    },
    isActive: true,
    rateLimit: 8
  },
  {
    siteName: 'jobnet',
    baseUrl: 'https://jobnet.co.il',
    searchUrl: 'https://jobnet.co.il/jobs?q={keywords}&l={location}',
    selectors: {
      jobCard: '.job-card',
      title: '.job-title',
      company: '.company-name',
      location: '.location',
      link: '.job-link'
    },
    isActive: true,
    rateLimit: 10
  }
];