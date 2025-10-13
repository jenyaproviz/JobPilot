// Backend pagination and search constants - centralized configuration
const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_RESULTS_PER_PAGE: 10,
  MAX_API_RESULTS: 100,
  DEFAULT_KEYWORDS: 'developer',
  DEFAULT_LOCATION: '',
  MAX_RESULTS_LIMIT: 200, // Maximum results to fetch in a single request
};

const GOOGLE_API_CONSTANTS = {
  REQUEST_TIMEOUT: 10000,
  MAX_REQUESTS_PER_SEARCH: 10,
  QUOTA_EXCEEDED_MESSAGE: 'Google API quota exceeded. Showing first 100 results.',
};

const FILTER_LIMITS = {
  MAX_SOURCES: 20,
  MAX_LOCATIONS: 50,
  MAX_COMPANIES: 100,
};

module.exports = {
  PAGINATION_CONSTANTS,
  GOOGLE_API_CONSTANTS,
  FILTER_LIMITS
};