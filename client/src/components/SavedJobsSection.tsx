import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import JobCard from './JobCard';
import type { Job } from '../types';

const SAVED_JOBS_KEY = 'savedJobs';

type SavedJobEntry = {
  saveKey: string;
  savedAt: string;
  job: Job;
};

const getSaveKey = (job: Job) => job.originalUrl || job.url || job._id || job.id || `${job.company}-${job.title}`;

const SavedJobsSection: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<SavedJobEntry[]>([]);

  const loadSavedJobs = () => {
    try {
      const raw = localStorage.getItem(SAVED_JOBS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setSavedJobs(Array.isArray(parsed) ? parsed.filter((entry) => entry?.job && entry?.saveKey) : []);
    } catch {
      setSavedJobs([]);
    }
  };

  useEffect(() => {
    loadSavedJobs();

    const handleStorage = () => loadSavedJobs();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('saved-jobs-updated', handleStorage as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('saved-jobs-updated', handleStorage as EventListener);
    };
  }, []);

  const removeSavedJob = (job: Job) => {
    const saveKey = getSaveKey(job);

    try {
      const nextSavedJobs = savedJobs.filter((entry) => entry.saveKey !== saveKey);
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(nextSavedJobs));
      setSavedJobs(nextSavedJobs);
      window.dispatchEvent(new CustomEvent('saved-jobs-updated'));
      toast.success('Removed from saved jobs.');
    } catch (error) {
      console.error('Failed to remove saved job:', error);
      toast.error('Failed to remove saved job.');
    }
  };

  const clearSavedJobs = () => {
    try {
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([]));
      setSavedJobs([]);
      window.dispatchEvent(new CustomEvent('saved-jobs-updated'));
      toast.success('Saved jobs cleared.');
    } catch (error) {
      console.error('Failed to clear saved jobs:', error);
      toast.error('Failed to clear saved jobs.');
    }
  };

  const orderedSavedJobs = useMemo(
    () => [...savedJobs].sort((left, right) => new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime()),
    [savedJobs]
  );

  return (
    <section className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Saved Jobs ({orderedSavedJobs.length})</h2>
            <p className="text-sm text-gray-500">Keep the roles you want to revisit or apply to later.</p>
          </div>
        </div>

        {orderedSavedJobs.length > 0 && (
          <button
            onClick={clearSavedJobs}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {orderedSavedJobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-8 text-center">
          <FolderOpen className="w-10 h-10 text-blue-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No saved jobs yet</h3>
          <p className="text-sm text-gray-600">Use the bookmark icon on any job card and it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orderedSavedJobs.map(({ saveKey, job }) => (
            <JobCard
              key={saveKey}
              job={job}
              isSaved
              onSave={() => removeSavedJob(job)}
              onViewDetails={(selectedJob) => {
                const link = selectedJob.originalUrl || selectedJob.url;
                if (link && link !== '#') {
                  window.open(link, '_blank', 'noopener,noreferrer');
                }
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SavedJobsSection;