import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Job, JobSearchQuery, JobSearchResponse } from '../types';
import { jobsApi } from '../services/api';

export interface JobsState {
  jobs: Job[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: {
    sources: string[];
    locations: string[];
    companies: string[];
    employmentTypes: string[];
  };
  searchQuery: JobSearchQuery;
  isLoading: boolean;
  error: string | null;
  selectedJob: Job | null;
}

const initialState: JobsState = {
  jobs: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  filters: {
    sources: [],
    locations: [],
    companies: [],
    employmentTypes: []
  },
  searchQuery: {
    keywords: '',
    page: 1,
    limit: 20
  },
  isLoading: false,
  error: null,
  selectedJob: null
};

// Async thunks
export const searchJobs = createAsyncThunk(
  'jobs/searchJobs',
  async (query: JobSearchQuery, { rejectWithValue }) => {
    try {
      const response = await jobsApi.searchJobs(query);
      console.log('Job Search API Response:', response);
      console.log('Response structure:', JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        return response;
      } else {
        console.error('API response indicates failure:', response);
        throw new Error((response as any)?.message || 'Search failed');
      }
    } catch (error: any) {
      console.error('Search jobs error:', error);
      return rejectWithValue(error.message || error.error || 'Failed to search jobs');
    }
  }
);

export const scrapeJobs = createAsyncThunk(
  'jobs/scrapeJobs',
  async ({ keywords, location, maxJobsPerSite }: { 
    keywords: string; 
    location?: string; 
    maxJobsPerSite?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await jobsApi.scrapeJobs(keywords, location, maxJobsPerSite);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to scrape jobs');
    }
  }
);

export const getJobById = createAsyncThunk(
  'jobs/getJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobsApi.getJobById(jobId);
      if (response.success) {
        return response.data as Job;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch job details');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<Partial<JobSearchQuery>>) => {
      state.searchQuery = { ...state.searchQuery, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedJob: (state, action: PayloadAction<Job | null>) => {
      state.selectedJob = action.payload;
    },
    clearJobs: (state) => {
      state.jobs = [];
      state.totalCount = 0;
      state.currentPage = 1;
      state.totalPages = 0;
    }
  },
  extraReducers: (builder) => {
    // Search jobs
    builder
      .addCase(searchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle the new API response structure: { success: true, results: { jobs: [...], count: 5 } }
        const response = action.payload as JobSearchResponse;
        
        if (response.results) {
          state.jobs = response.results.jobs || [];
          state.totalCount = response.results.count || 0;
        } else {
          // Fallback for legacy structure or direct access
          state.jobs = (response as any).jobs || [];
          state.totalCount = (response as any).totalCount || (response as any).count || 0;
        }
        
        state.currentPage = state.searchQuery.page || 1;
        state.totalPages = Math.ceil(state.totalCount / (state.searchQuery.limit || 20));
        
        // Update filters based on current search
        const sources = response.query?.sources || [];
        state.filters = {
          ...state.filters,
          sources: sources
        };
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Scrape jobs
      .addCase(scrapeJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(scrapeJobs.fulfilled, (state) => {
        state.isLoading = false;
        // Optionally trigger a new search after scraping
      })
      .addCase(scrapeJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
    // Get job by ID
      .addCase(getJobById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getJobById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedJob = action.payload;
      })
      .addCase(getJobById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setSearchQuery, clearError, setSelectedJob, clearJobs } = jobsSlice.actions;
export default jobsSlice.reducer;