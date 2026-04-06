import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Briefcase, TrendingUp, Brain, Upload } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { personalizedSearchJobs, searchJobs, setSearchQuery } from '../store/jobsSlice';
import { jobsApi } from '../services/api';
import { PAGINATION } from '../constants/pagination';

const JobSearchForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchQuery, isLoading } = useAppSelector((state) => state.jobs);
  const [trendingKeywords, setTrendingKeywords] = useState<string[]>([]);
  const [usePersonalizedSearch, setUsePersonalizedSearch] = useState(false);
  const [profile, setProfile] = useState({
    yearsExperience: '',
    technicalSkills: '',
    languages: '',
    radiusKm: '40',
    resume: null as File | null
  });
  
  const [localQuery, setLocalQuery] = useState({
    keywords: searchQuery.keywords || '',
    location: searchQuery.location || '',
    employmentType: searchQuery.employmentType || '',
    experienceLevel: searchQuery.experienceLevel || '',
    datePosted: searchQuery.datePosted || 'all'
  });

  // Fetch trending keywords on component mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await jobsApi.getTrendingKeywords();
        if (response.success && response.data) {
          setTrendingKeywords(response.data.trending);
        }
      } catch (error) {
        console.error('Failed to fetch trending keywords:', error);
        // Fallback to default keywords
        setTrendingKeywords([
          'React Developer',
          'Full Stack',
          'Product Manager',
          'DevOps Engineer',
          'Data Scientist'
        ]);
      }
    };
    
    fetchTrending();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const hasKeywordInput = localQuery.keywords.trim() || profile.technicalSkills.trim() || profile.resume;
    if (!hasKeywordInput) {
      alert('Please enter keywords, skills, or upload a resume');
      return;
    }

    const query = {
      ...localQuery,
      page: PAGINATION.DEFAULT_PAGE,
      limit: PAGINATION.DEFAULT_RESULTS_PER_PAGE
    };

    dispatch(setSearchQuery(query));

    if (usePersonalizedSearch) {
      dispatch(personalizedSearchJobs({
        keywords: localQuery.keywords,
        location: localQuery.location,
        preferredKeywords: localQuery.keywords
          .split(/[\n,;]+/)
          .map((item) => item.trim())
          .filter(Boolean),
        technicalSkills: profile.technicalSkills
          .split(/[\n,;]+/)
          .map((item) => item.trim())
          .filter(Boolean),
        languages: profile.languages
          .split(/[\n,;]+/)
          .map((item) => item.trim())
          .filter(Boolean),
        yearsExperience: profile.yearsExperience ? parseInt(profile.yearsExperience, 10) : undefined,
        radiusKm: profile.radiusKm ? parseInt(profile.radiusKm, 10) : undefined,
        resume: profile.resume,
        page: PAGINATION.DEFAULT_PAGE,
        limit: 50
      }));
      return;
    }

    dispatch(searchJobs(query));
  };

  // Removed scraping functionality - using Google search instead

  const handleInputChange = (field: string, value: string) => {
    setLocalQuery(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileChange = (field: string, value: string | File | null) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-6">
        <Briefcase className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Find Your Dream Job</h2>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <div>
            <div className="flex items-center gap-2 text-blue-900 font-medium">
              <Brain className="w-4 h-4" />
              Personalized AI-style matching
            </div>
            <p className="text-sm text-blue-700">Use your criteria and resume to rank job results by fit.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-blue-900">
            <input
              type="checkbox"
              checked={usePersonalizedSearch}
              onChange={(e) => setUsePersonalizedSearch(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Enable
          </label>
        </div>

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
            {isLoading ? 'Searching...' : usePersonalizedSearch ? 'Search with Profile' : 'Search Jobs'}
          </button>
        </div>

        {usePersonalizedSearch && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of experience</label>
              <input
                type="number"
                min="0"
                max="40"
                value={profile.yearsExperience}
                onChange={(e) => handleProfileChange('yearsExperience', e.target.value)}
                placeholder="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search radius in km</label>
              <input
                type="number"
                min="0"
                max="200"
                value={profile.radiusKm}
                onChange={(e) => handleProfileChange('radiusKm', e.target.value)}
                placeholder="40"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Technical skills</label>
              <textarea
                value={profile.technicalSkills}
                onChange={(e) => handleProfileChange('technicalSkills', e.target.value)}
                placeholder="React, TypeScript, Python"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <textarea
                value={profile.languages}
                onChange={(e) => handleProfileChange('languages', e.target.value)}
                placeholder="Russian, English, Hebrew"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload resume</label>
              <label className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <Upload className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">
                  {profile.resume ? profile.resume.name : 'Upload TXT, PDF, or DOCX resume'}
                </span>
                <input
                  type="file"
                  accept=".txt,.md,.pdf,.docx"
                  className="hidden"
                  onChange={(e) => handleProfileChange('resume', e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>
        )}

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


        </div>
      </form>
      
      {/* Popular Searches */}
      {trendingKeywords.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h4 className="font-medium text-orange-900">🔥 Popular Searches in Israel</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingKeywords.slice(0, 8).map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => {
                  setLocalQuery(prev => ({ ...prev, keywords: keyword }));
                  const query = { ...localQuery, keywords: keyword, page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_RESULTS_PER_PAGE };
                  dispatch(setSearchQuery(query));
                  dispatch(searchJobs(query));
                }}
                className="px-3 py-1.5 bg-white text-orange-700 text-sm font-medium rounded-full border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Search Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Try specific technologies: "React TypeScript", "Node.js Express"</li>
          <li>• Use job titles: "Frontend Developer", "DevOps Engineer"</li>
          <li>• Our intelligent search finds jobs from multiple sources using Google</li>
          <li>• Include location for more targeted results: "Tel Aviv", "Remote"</li>
          <li>• Use filters to narrow down by experience level and employment type</li>
        </ul>
      </div>

      {/* Google Search Link */}
      {localQuery.keywords && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-green-900 mb-1">🔍 Search Directly on Google</h4>
              <p className="text-sm text-green-700">Open our custom job search engine in a new tab</p>
            </div>
            <a
              href={`https://cse.google.com/cse?cx=a3736d241b91c440e&q=${encodeURIComponent(
                localQuery.keywords + (localQuery.location ? ' ' + localQuery.location : '')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search on Google
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSearchForm;