import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Loader2, AlertCircle, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../hooks/redux';
import { personalizedSearchJobs, searchJobs, setSearchQuery } from '../store/jobsSlice';
import type { RootState } from '../store';
import JobCard from './JobCard';
import Pagination from './Pagination';
import { PAGINATION } from '../constants/pagination';
import type { Job } from '../types';

const SAVED_JOBS_KEY = 'savedJobs';

const getSaveKey = (job: Job) => job.originalUrl || job.url || job._id || job.id || `${job.company}-${job.title}`;

const tokenizeKeywords = (value: string) => {
  return [...new Set(
    value
      .split(/[\n,;\/\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 1)
  )];
};

const matchesTerm = (haystack: string, term: string) => {
  const normalizedHaystack = haystack.toLowerCase();
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) {
    return false;
  }

  if (normalizedTerm.includes(' ')) {
    return normalizedHaystack.includes(normalizedTerm);
  }

  const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(normalizedHaystack);
};

const toLabel = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const normalizeVisibleMatchScore = (rawScore: number) => {
  if (rawScore <= 0) {
    return 0;
  }

  return Math.round(40 + (Math.min(rawScore, 100) * 0.6));
};

const JobSearchResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const { jobs, isLoading, error, searchQuery, totalCount, totalResultsAvailable, maxResultsReturnable, currentPage, searchMode, lastPersonalizedInput } = useSelector((state: RootState) => state.jobs);
  const [savedKeys, setSavedKeys] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_JOBS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setSavedKeys(parsed.map((entry) => String(entry?.saveKey || '')).filter(Boolean));
      }
    } catch {
      setSavedKeys([]);
    }
  }, []);

  const savedKeySet = useMemo(() => new Set(savedKeys), [savedKeys]);

  const displayJobs = useMemo(() => {
    return jobs.map((job) => {
      if (typeof job.matchScore === 'number') {
        return job;
      }

      const requestedTerms = tokenizeKeywords(searchQuery.keywords || '');
      if (requestedTerms.length === 0) {
        return job;
      }

      const titleHaystack = [job.title, ...(job.requirements || [])].join(' ').toLowerCase();
      const fullHaystack = [
        job.title,
        job.company,
        job.location,
        job.description,
        ...(job.requirements || []),
        ...(job.keywords || [])
      ].join(' ').toLowerCase();

      const matchedTerms = requestedTerms.filter((term) => matchesTerm(fullHaystack, term));
      const matchedInTitle = requestedTerms.filter((term) => matchesTerm(titleHaystack, term));
      const missingTerms = requestedTerms.filter((term) => !matchedTerms.includes(term)).slice(0, 5);

      let score = 0;
      score += Math.round((matchedTerms.length / requestedTerms.length) * 70);
      score += Math.min(matchedInTitle.length * 10, 20);

      if (searchQuery.location && job.location.toLowerCase().includes(searchQuery.location.toLowerCase())) {
        score += 10;
      }

      if (searchQuery.employmentType && searchQuery.employmentType !== 'any') {
        if (job.employmentType.toLowerCase() === searchQuery.employmentType.toLowerCase()) {
          score += 5;
        }
      }

      if (searchQuery.experienceLevel && searchQuery.experienceLevel !== 'any') {
        if (job.experienceLevel.toLowerCase() === searchQuery.experienceLevel.toLowerCase()) {
          score += 5;
        }
      }

      const rawScore = Math.max(0, Math.min(100, score));
      const matchScore = normalizeVisibleMatchScore(rawScore);

      return {
        ...job,
        matchScore,
        aiAnalysis: job.aiAnalysis || {
          matchingSkills: matchedTerms.map(toLabel),
          missingSkills: missingTerms.map(toLabel),
          recommendations: missingTerms.length > 0
            ? [`Try refining with ${missingTerms.slice(0, 2).join(', ')} to improve targeting.`]
            : ['Strong alignment with your current search terms.'],
          overallAssessment: matchScore >= 75
            ? 'High match'
            : matchScore >= 50
              ? 'Moderate match'
              : 'Low match'
        }
      };
    });
  }, [jobs, searchQuery]);

  const runPagedSearch = (page: number, limit: number) => {
    if (searchMode === 'personalized' && lastPersonalizedInput) {
      dispatch(personalizedSearchJobs({
        ...lastPersonalizedInput,
        page,
        limit
      }));
      return;
    }

    const newQuery = { ...searchQuery, page, limit };
    dispatch(setSearchQuery(newQuery));
    dispatch(searchJobs(newQuery));
  };

  const handleSaveJob = (job: Job) => {
    const saveKey = getSaveKey(job);
    if (!saveKey) {
      toast.error('This job cannot be saved yet.');
      return;
    }

    try {
      const raw = localStorage.getItem(SAVED_JOBS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const savedJobs = Array.isArray(parsed) ? parsed : [];

      if (savedJobs.some((entry) => entry?.saveKey === saveKey)) {
        const nextSavedJobs = savedJobs.filter((entry) => entry?.saveKey !== saveKey);
        localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(nextSavedJobs));
        setSavedKeys((current) => current.filter((item) => item !== saveKey));
        window.dispatchEvent(new CustomEvent('saved-jobs-updated'));
        toast.success('Removed from saved jobs.');
        return;
      }

      const nextSavedJobs = [
        {
          saveKey,
          savedAt: new Date().toISOString(),
          job
        },
        ...savedJobs
      ];

      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(nextSavedJobs));
      setSavedKeys((current) => [saveKey, ...current]);
      window.dispatchEvent(new CustomEvent('saved-jobs-updated'));
      toast.success('Job saved.');
    } catch (saveError) {
      console.error('Failed to save job locally:', saveError);
      toast.error('Failed to save job.');
    }
  };

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
          <span className="text-gray-600">Searching and ranking jobs...</span>
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
          Job Results ({displayJobs.length})
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayJobs.map((job) => (
          <JobCard
            key={job._id || job.id || getSaveKey(job)}
            job={job}
            isSaved={savedKeySet.has(getSaveKey(job))}
            onSave={() => handleSaveJob(job)}
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
          totalPages={Math.ceil((totalResultsAvailable ? Math.min(totalResultsAvailable, maxResultsReturnable || PAGINATION.MAX_API_RESULTS) : totalCount) / (searchQuery.limit || PAGINATION.DEFAULT_RESULTS_PER_PAGE))}
          totalResults={totalCount}
          totalResultsAvailable={totalResultsAvailable}
          maxResultsReturnable={maxResultsReturnable}
          resultsPerPage={searchQuery.limit || PAGINATION.DEFAULT_RESULTS_PER_PAGE}
          onPageChange={(page) => {
            runPagedSearch(page, searchQuery.limit || PAGINATION.DEFAULT_RESULTS_PER_PAGE);
          }}
          onResultsPerPageChange={(resultsPerPage) => {
            runPagedSearch(1, resultsPerPage);
          }}
        />
      )}
    </div>
  );
};

export default JobSearchResults;