import React from 'react';
import { X, MapPin, Calendar, DollarSign, ExternalLink, Bookmark, Building, Clock, Users, Award } from 'lucide-react';
import type { Job } from '../types';

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobId: string) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, isOpen, onClose, onSave }) => {
  if (!isOpen || !job) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  <span className="font-semibold">{job.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Job Meta Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {job.salary && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Salary</p>
                  <p className="text-sm font-semibold text-green-900">{job.salary}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-medium">Posted</p>
                <p className="text-sm font-semibold text-blue-900">
                  {job.postedDate ? formatDate(job.postedDate) : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600 font-medium">Source</p>
                <p className="text-sm font-semibold text-purple-900 capitalize">{job.source}</p>
              </div>
            </div>

            {job.matchScore && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-xs text-yellow-600 font-medium">Match Score</p>
                  <p className="text-sm font-semibold text-yellow-900">{job.matchScore}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className={`px-3 py-2 rounded-full text-sm font-medium ${getEmploymentTypeColor(job.employmentType)}`}>
              {job.employmentType.replace('-', ' ')}
            </span>
            <span className={`px-3 py-2 rounded-full text-sm font-medium ${getExperienceLevelColor(job.experienceLevel)}`}>
              {job.experienceLevel} level
            </span>
            <span className="px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {job.source}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills & Technologies</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {job.requirements.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200 text-center"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {job.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {Array.isArray(job.keywords) && job.keywords.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {job.keywords.slice(0, 10).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => job._id && onSave(job._id)}
              disabled={!job._id}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors${!job._id ? ' opacity-50 cursor-not-allowed' : ''}`}
            >
              <Bookmark className="w-5 h-5" />
              Save Job
            </button>
            <button
              onClick={() => window.open(job.originalUrl, '_blank')}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Apply Now
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;