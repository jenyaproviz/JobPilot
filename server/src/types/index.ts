export interface IJob {
  _id?: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  source: string; // 'linkedin', 'glassdoor', 'indeed', etc.
  originalUrl: string;
  postedDate: Date;
  scrapedAt: Date;
  keywords: string[];
  isActive: boolean;
  matchScore?: number; // AI-generated relevance score for user
}

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferences: IUserPreferences;
  savedJobs: string[]; // Job IDs
  searchHistory: ISearchHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPreferences {
  keywords: string[];
  locations: string[];
  salaryRange: {
    min?: number;
    max?: number;
  };
  employmentTypes: string[];
  experienceLevels: string[];
  companySizes?: string[];
  industries?: string[];
  remoteWork: boolean;
}

export interface ISearchHistory {
  query: string;
  filters: Partial<IUserPreferences>;
  resultsCount: number;
  timestamp: Date;
}

export interface IScrapingConfig {
  siteName: string;
  baseUrl: string;
  searchUrl: string;
  selectors: {
    jobCard: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
    description?: string;
    link: string;
    postedDate?: string;
  };
  isActive: boolean;
  rateLimit: number; // requests per minute
  lastScraped?: Date;
}

export interface IJobSearchQuery {
  keywords: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType?: string;
  experienceLevel?: string;
  datePosted?: 'today' | 'week' | 'month' | 'all';
  source?: string;
  page?: number;
  limit?: number;
}

export interface IJobSearchResponse {
  jobs: IJob[];
  totalCount: number;
  page: number;
  totalPages: number;
  filters: {
    sources: string[];
    locations: string[];
    companies: string[];
    employmentTypes: string[];
  };
}

export interface IIntelligentJob extends IJob {
  matchScore?: number;
  aiAnalysis?: {
    matchingSkills: string[];
    missingSkills: string[];
    recommendations: string[];
    overallAssessment: string;
  };
}

export interface IIntelligentJobSearchResponse extends IJobSearchResponse {
  jobs: IIntelligentJob[];
  aiEnhanced: boolean;
  aiError?: string;
  optimization?: {
    originalKeywords: string;
    optimizedKeywords: string;
    resultImprovement: number;
  };
}