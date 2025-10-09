import React, { useState } from 'react';
import { ExternalLink, Heart, MapPin, Globe } from 'lucide-react';

interface JobSite {
  id: string;
  name: string;
  url: string;
  description: string;
  location: string;
  category: string;
  logo?: string;
  featured?: boolean;
}

interface JobSiteCardProps {
  jobSite: JobSite;
  isFavorite: boolean;
  onToggleFavorite: (siteId: string) => void;
}

const JobSiteCard: React.FC<JobSiteCardProps> = ({ 
  jobSite, 
  isFavorite, 
  onToggleFavorite 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleViewDetails = () => {
    window.open(jobSite.url, '_blank', 'noopener,noreferrer');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(jobSite.id);
  };

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 
        border border-gray-100 p-6 cursor-pointer transform hover:-translate-y-1 relative overflow-hidden
        ${jobSite.featured ? 'ring-2 ring-blue-200' : ''}
        ${isHovered ? 'shadow-xl' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Logo and Title */}
      <div className="flex items-start justify-between mb-4 min-w-0">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {jobSite.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
              {jobSite.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="text-gray-600">{jobSite.location}</span>
            </div>
          </div>
        </div>

        {/* Featured Badge and Favorite Button */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          {/* Featured Badge */}
          {jobSite.featured && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full whitespace-nowrap">
              ⭐ Featured
            </span>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`
              p-2 rounded-full transition-all duration-200 hover:scale-110
              ${isFavorite 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-500'
              }
            `}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} 
            />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-6 line-clamp-2 flex-grow">
        {jobSite.description}
      </p>

      {/* URL Info */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Globe className="w-4 h-4" />
        <span className="truncate">
          {jobSite.url.replace('https://', '').replace('http://', '')}
        </span>
      </div>

      {/* View Site Button - Bottom */}
      <div className="mt-auto">
        <button
          onClick={handleViewDetails}
          className="
            w-full flex items-center justify-center space-x-2 px-4 py-3 
            bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            transition-colors duration-200 font-medium text-sm
          "
        >
          <span>View Site</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default JobSiteCard;