export interface Job {
  id?: string; // Google search uses 'id', Israeli search uses '_id'
  _id?: string; // Keep backward compatibility
  title: string;
  company: string;
  location: string;
  salary?: string;
  salaryRange?: string; // Google search format
  description: string;
  requirements?: string[];
  benefits?: string[];
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship' | 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive' | 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Principal';
  source: string;
  originalUrl?: string;
  url?: string; // Google search format
  postedDate?: string;
  datePosted?: string; // Google search format
  scrapedAt?: string;
  keywords?: string[];
  isActive?: boolean;
  matchScore?: number;
  jobScore?: number; // Google search format
  isRemote?: boolean; // Google search feature
  isLikelyJob?: boolean; // Google search confidence score
}

export interface JobSearchQuery {
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
  // Google search specific features
  remote?: boolean;
  useMultipleQueries?: boolean;
}

export interface JobSearchResponse {
  success: boolean;
  query: {
    keywords: string;
    location: string;
    sources: string[];
    limit: number;
  };
  results: {
    count: number;
    jobs: Job[];
  };
  timestamp: string;
}

// Legacy interface for backward compatibility
export interface LegacyJobSearchResponse {
  jobs: Job[];
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: any;
}