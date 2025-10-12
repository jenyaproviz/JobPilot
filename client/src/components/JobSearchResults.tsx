import React from 'react';
import { useSelector } from 'react-redux';
import { Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { useAppDispatch } from '../hooks/redux';
import { searchJobs, setSearchQuery } from '../store/jobsSlice';
import type { RootState } from '../store';
import JobCard from './JobCard';
import Pagination from './Pagination';

const JobSearchResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, isLoading, error, searchQuery, totalCount, totalResultsAvailable, maxResultsReturnable, currentPage } = useSelector((state: RootState) => state.jobs);

  // Don't show anything if no search has been performed
  if (!isLoading && !error && jobs.length === 0 && !searchQuery.keywords) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Searching for jobs from Israeli job sites...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-center text-red-600">
          <AlertCircle className="w-6 h-6 mr-3" />
          <span>Error searching for jobs: {error}</span>
        </div>
      </div>
    );
  }

  // No results state
  if (jobs.length === 0 && searchQuery.keywords) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="text-center text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p>Try different keywords or check back later for new opportunities.</p>
        </div>
      </div>
    );
  }

  // Results state
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Job Results ({jobs.length})
        </h2>
      </div>
      
      <div className="grid gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onSave={() => console.log('Save job:', job._id)}
            onViewDetails={() => {
              if (job.originalUrl && job.originalUrl !== '#') {
                window.open(job.originalUrl, '_blank', 'noopener,noreferrer');
              } else {
                console.log('No valid URL for job:', job);
              }
            }}
          />
        ))}
      </div>
      
      {jobs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil((totalResultsAvailable ? Math.min(totalResultsAvailable, maxResultsReturnable || 100) : totalCount) / (searchQuery.limit || 25))}
          totalResults={totalCount}
          totalResultsAvailable={totalResultsAvailable}
          maxResultsReturnable={maxResultsReturnable}
          resultsPerPage={searchQuery.limit || 25}
          onPageChange={(page) => {
            const newQuery = { ...searchQuery, page };
            dispatch(setSearchQuery(newQuery));
            dispatch(searchJobs(newQuery));
          }}
          onResultsPerPageChange={(resultsPerPage) => {
            const newQuery = { ...searchQuery, limit: resultsPerPage, page: 1 };
            dispatch(setSearchQuery(newQuery));
            dispatch(searchJobs(newQuery));
          }}
        />
      )}
    </div>
  );
};

export default JobSearchResults;