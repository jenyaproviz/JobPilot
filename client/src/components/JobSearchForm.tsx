import React, { useState } from 'react';
import { Search, MapPin, Filter, Briefcase, Zap } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { searchJobs, scrapeJobs, setSearchQuery } from '../store/jobsSlice';

const JobSearchForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchQuery, isLoading } = useAppSelector((state) => state.jobs);
  
  const [localQuery, setLocalQuery] = useState({
    keywords: searchQuery.keywords || '',
    location: searchQuery.location || '',
    employmentType: searchQuery.employmentType || '',
    experienceLevel: searchQuery.experienceLevel || '',
    datePosted: searchQuery.datePosted || 'all'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localQuery.keywords.trim()) {
      alert('Please enter job keywords');
      return;
    }

    const query = {
      ...localQuery,
      page: 1,
      limit: 20
    };

    dispatch(setSearchQuery(query));
    dispatch(searchJobs(query));
  };

  const handleScrape = () => {
    if (!localQuery.keywords.trim()) {
      alert('Please enter job keywords to scrape');
      return;
    }

    dispatch(scrapeJobs({
      keywords: localQuery.keywords,
      location: localQuery.location || undefined,
      maxJobsPerSite: 50
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalQuery(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Find Your Dream Job</h2>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Main Search Row */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Keywords *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localQuery.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="e.g., React Developer, Full Stack, JavaScript"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={localQuery.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Tel Aviv, Remote, etc."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search Jobs'}
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline w-4 h-4 mr-1" />
              Employment Type
            </label>
            <select
              value={localQuery.employmentType}
              onChange={(e) => handleInputChange('employmentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Type</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={localQuery.experienceLevel}
              onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any Level</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Posted
            </label>
            <select
              value={localQuery.datePosted}
              onChange={(e) => handleInputChange('datePosted', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Any Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="pt-7">
            <button
              type="button"
              onClick={handleScrape}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {isLoading ? 'Scraping...' : 'Scrape Fresh Jobs'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Search Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Search Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Try specific technologies: "React TypeScript", "Node.js Express"</li>
          <li>• Use job titles: "Frontend Developer", "DevOps Engineer"</li>
          <li>• Click "Scrape Fresh Jobs" to get the latest postings from job sites</li>
        </ul>
      </div>
    </div>
  );
};

export default JobSearchForm;