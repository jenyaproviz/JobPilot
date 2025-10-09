import React, { useState, useEffect } from 'react';
import { Search, Heart, Star } from 'lucide-react';
import JobSiteCard from './JobSiteCard';

interface JobSite {
  id: string;
  name: string;
  url: string;
  description: string;
  location: string;
  category: string;
  featured?: boolean;
}

interface JobSitesViewProps {
  searchQuery?: string;
}

const JOB_CATEGORIES = [
  'All Categories', 'General Jobs', 'Tech Jobs', 'Tech Giants', 
  'Executive Jobs', 'Professional Network', 'Aerospace & Defense'
];

const JOB_LOCATIONS = ['All Locations', 'Israel', 'Global'];

const JobSitesView: React.FC<JobSitesViewProps> = ({ searchQuery = '' }) => {
  const [jobSites, setJobSites] = useState<JobSite[]>([]);
  const [filteredSites, setFilteredSites] = useState<JobSite[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    loadJobSites();
    loadFavorites();
  }, []);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    filterSites();
  }, [jobSites, searchTerm, selectedCategory, selectedLocation, showFavoritesOnly, favorites]);

  const loadJobSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/job-sites');
      const data = await response.json();
      
      if (data.success) {
        setJobSites(data.data.sites);
      } else {
        throw new Error(data.message || 'Failed to load job sites');
      }
    } catch (err) {
      console.error('Error loading job sites:', err);
      setError('Failed to load job sites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    try {
      const savedFavorites = localStorage.getItem('jobSitesFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const handleToggleFavorite = (siteId: string) => {
    const newFavorites = favorites.includes(siteId)
      ? favorites.filter(id => id !== siteId)
      : [...favorites, siteId];
    
    localStorage.setItem('jobSitesFavorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const filterSites = () => {
    let filtered = [...jobSites];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchLower) ||
        site.description.toLowerCase().includes(searchLower) ||
        site.category.toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(site => site.category === selectedCategory);
    }

    if (selectedLocation !== 'All Locations') {
      filtered = filtered.filter(site => site.location === selectedLocation);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(site => favorites.includes(site.id));
    }

    setFilteredSites(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setShowFavoritesOnly(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading job sites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">⚠️ {error}</div>
        <button 
          onClick={loadJobSites}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 Job Search Sites Directory
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the best Israeli and international job search platforms. 
          Browse, save your favorites, and find your next career opportunity.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search job sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location Filter First */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {JOB_LOCATIONS.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          {/* Category Filter Second */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {JOB_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
              showFavoritesOnly 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span>Favorites</span>
            {favorites.length > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={clearFilters}
            className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {filteredSites.length} of {jobSites.length} job sites
          {searchTerm && ` for "${searchTerm}"`}
        </span>
        {favorites.length > 0 && (
          <span className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{favorites.length} favorited</span>
          </span>
        )}
      </div>

      {/* Job Sites Grid */}
      {filteredSites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <JobSiteCard
              key={site.id}
              jobSite={site}
              isFavorite={favorites.includes(site.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No job sites found</h3>
          <p className="text-gray-600 mb-4">
            {showFavoritesOnly 
              ? "You haven't favorited any job sites yet."
              : "Try adjusting your search criteria or filters."
            }
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default JobSitesView;