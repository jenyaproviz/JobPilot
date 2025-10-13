// Pagination constants - centralized configuration
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_RESULTS_PER_PAGE: 10,
  MAX_API_RESULTS: 100,
  RESULTS_PER_PAGE_OPTIONS: [10, 25, 50] as const,
  PAGE_NAVIGATION_DELTA: 2, // Number of pages to show on each side of current page
  MAX_PAGINATION_BUTTONS: 5, // Maximum number of page buttons to show
} as const;

// Type for results per page options
export type ResultsPerPageOption = typeof PAGINATION.RESULTS_PER_PAGE_OPTIONS[number];