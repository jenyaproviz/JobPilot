import axios from 'axios';
import type { JobSearchQuery, JobSearchResponse, ApiResponse, Job } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Environment VITE_API_URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Response interceptor to handle API responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    throw error.response?.data || { success: false, message: 'Network error' };
  }
);

export const jobsApi = {
  // Search jobs with Israeli job sites scraping
  searchJobs: (query: JobSearchQuery): Promise<ApiResponse<JobSearchResponse>> => {
    const params = new URLSearchParams();
    
    // Map frontend parameters to job search API
    if (query.keywords) params.append('q', query.keywords);
    if (query.location) params.append('location', query.location);
    if (query.limit) params.append('limit', query.limit.toString());
    
    // Add sources for Israeli job sites
    params.append('sources', 'alljobs,drushim,jobmaster');
    
    console.log('🇮🇱 Searching Israeli jobs from multiple sources:', params.toString());

    return api.get(`/job-search/search?${params.toString()}`);
  },

  // Get trending job keywords
  getTrendingKeywords: (): Promise<ApiResponse<{ trending: string[] }>> => {
    return api.get('/job-search/trending');
  },

  // Get job categories
  getJobCategories: (): Promise<ApiResponse<{ categories: { name: string; count: number }[] }>> => {
    return api.get('/job-search/categories');
  },

  // Get search suggestions
  getSearchSuggestions: (query: string): Promise<ApiResponse<{ suggestions: string[] }>> => {
    const params = new URLSearchParams();
    params.append('q', query);
    return api.get(`/job-search/suggest?${params.toString()}`);
  },

  // Legacy Google-powered search (fallback)
  searchGlobalJobs: (query: JobSearchQuery): Promise<ApiResponse<JobSearchResponse>> => {
    const params = new URLSearchParams();
    
    // Map frontend parameters to Google job server parameters
    if (query.keywords) params.append('q', query.keywords); // Google server uses 'q' parameter
    if (query.location) params.append('location', query.location);
    if (query.limit) params.append('limit', query.limit.toString());
    
    // Add additional Google search filters
    if (query.remote) params.append('remote', 'true');
    if (query.experienceLevel) params.append('experienceLevel', query.experienceLevel);
    if (query.employmentType) params.append('employmentType', query.employmentType);
    
    console.log('🌍 Fallback: Searching global jobs with Google-powered search:', params.toString());

    return api.get(`/jobs/search?${params.toString()}`);
  },

  // Get job details
  getJobById: (jobId: string): Promise<ApiResponse<Job>> => {
    return api.get(`/jobs/${jobId}`);
  },

  // Trigger job scraping
  scrapeJobs: (keywords: string, location?: string, maxJobsPerSite?: number): Promise<ApiResponse> => {
    return api.post('/jobs/scrape', {
      keywords,
      location: location || '',
      maxJobsPerSite: maxJobsPerSite || 50
    });
  },

  // Save a job
  saveJob: (jobId: string): Promise<ApiResponse> => {
    return api.post(`/jobs/${jobId}/save`, { userId: 'temp-user' }); // TODO: Replace with real user ID
  },

  // Get job statistics
  getJobStats: (): Promise<ApiResponse> => {
    return api.get('/jobs/stats/overview');
  },

  // Health check
  healthCheck: (): Promise<ApiResponse> => {
    return api.get('/health');
  }
};