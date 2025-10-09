import React from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import JobCard from './JobCard';
import type { Job } from '../types';

interface JobListProps {
  jobs: Job[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onSaveJob: (jobId: string) => void;
  onViewDetails: (job: Job) => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  error,
  onPageChange,
  onSaveJob,
  onViewDetails,
}) => {
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
          <span className="text-lg text-gray-600">Searching for jobs...</span>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          This may take a moment as we gather the latest job postings
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search criteria or scraping fresh jobs from job sites.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg text-left">
          <h4 className="font-medium text-blue-900 mb-2">💡 Suggestions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Try broader keywords like "developer" instead of "senior react developer"</li>
            <li>• Remove location filters to see more results</li>
            <li>• Click "Scrape Fresh Jobs" to get the latest postings</li>
            <li>• Try different employment types or experience levels</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {totalCount.toLocaleString()} Jobs Found
          </h2>
          <p className="text-gray-600">
            Showing page {currentPage} of {totalPages} 
            ({((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalCount)} jobs)
          </p>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(1, currentPage - 2);
              if (page > totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onSave={onSaveJob}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-900 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobList;