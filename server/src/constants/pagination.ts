// Backend pagination and search constants - centralized configuration
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_RESULTS_PER_PAGE: 10,
  MAX_API_RESULTS: 100,
  DEFAULT_KEYWORDS: 'developer',
  DEFAULT_LOCATION: '',
  MAX_RESULTS_LIMIT: 200, // Maximum results to fetch in a single request
} as const;

// Filter limits for dropdown options
export const FILTER_LIMITS = {
  MAX_SOURCES: 20,
  MAX_LOCATIONS: 50,
  MAX_COMPANIES: 100,
} as const;

// Google API specific constants
export const GOOGLE_API_CONSTANTS = {
  MAX_RESULTS_PER_REQUEST: 10, // Google API limitation per request
  MAX_TOTAL_REQUESTS: 10, // Maximum number of requests to make
  REQUEST_TIMEOUT: 15000, // Timeout for each request in milliseconds
} as const;