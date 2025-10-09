import React from 'react';
import { MapPin, Calendar, DollarSign, ExternalLink, Bookmark, Clock, Building } from 'lucide-react';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onViewDetails?: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onSave, onViewDetails }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getEmploymentTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-purple-100 text-purple-800',
      'freelance': 'bg-orange-100 text-orange-800',
      'internship': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceLevelColor = (level: string) => {
    const colors = {
      'entry': 'bg-emerald-100 text-emerald-800',
      'mid': 'bg-blue-100 text-blue-800',
      'senior': 'bg-indigo-100 text-indigo-800',
      'executive': 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 cursor-pointer"
              onClick={() => onViewDetails?.(job)}>
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Building className="w-4 h-4" />
            <span className="font-medium">{job.company}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded capitalize">
              {job.source}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => job._id && onSave?.(job._id)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Save job"
          >
            <Bookmark className="w-5 h-5" />
          </button>
          <a
            href={job.originalUrl || job.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View original posting"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{job.location}</span>
        </div>
        
        {(job.salary || job.salaryRange) && (
          <div className="flex items-center gap-1 text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{job.salary || job.salaryRange}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {(job.postedDate || job.datePosted) ? formatDate((job.postedDate || job.datePosted)!) : 'Recently Posted'}
          </span>
        </div>

        {(job.scrapedAt || job.datePosted) && (
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Scraped {job.scrapedAt ? formatDate(job.scrapedAt) : 'recently'}
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(job.employmentType)}`}>
          {job.employmentType.replace('-', ' ')}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(job.experienceLevel)}`}>
          {job.experienceLevel} level
        </span>
        {job.matchScore && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {job.matchScore}% match
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mb-4 leading-relaxed">
        {truncateDescription(job.description)}
      </p>

      {/* Skills/Requirements */}
      {((Array.isArray(job.requirements) && job.requirements.length > 0) || 
        (Array.isArray(job.keywords) && job.keywords.length > 0)) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
          <div className="flex flex-wrap gap-1">
            {/* Show requirements if available, otherwise show keywords */}
            {(Array.isArray(job.requirements) && job.requirements.length > 0 
              ? job.requirements 
              : (Array.isArray(job.keywords) ? job.keywords : [])
            ).slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border"
              >
                {skill}
              </span>
            ))}
            {/* Show "more" indicator */}
            {(Array.isArray(job.requirements) && job.requirements.length > 6) ? (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{job.requirements.length - 6} more
              </span>
            ) : (Array.isArray(job.keywords) && job.keywords.length > 6) ? (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{job.keywords.length - 6} more
              </span>
            ) : null}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => onViewDetails?.(job)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => window.open(job.originalUrl || job.url || '#', '_blank')}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default JobCard;