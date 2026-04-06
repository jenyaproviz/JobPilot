import React from 'react';
import { MapPin, Calendar, DollarSign, ExternalLink, Bookmark, Clock, Building } from 'lucide-react';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onSave?: (jobId: string) => void;
  onViewDetails?: (job: Job) => void;
  isSaved?: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays <= 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1}d ago`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
};

const scoreTheme = (score?: number) => {
  if (!score) return { border: 'border-l-slate-300', badge: 'bg-slate-100 text-slate-600', ring: 'text-slate-500' };
  if (score >= 75) return { border: 'border-l-emerald-500', badge: 'bg-emerald-500 text-white', ring: 'text-emerald-600' };
  if (score >= 50) return { border: 'border-l-amber-400', badge: 'bg-amber-400 text-white', ring: 'text-amber-600' };
  return { border: 'border-l-blue-400', badge: 'bg-blue-400 text-white', ring: 'text-blue-500' };
};

const employmentColor = (type: string) => {
  const map: Record<string, string> = {
    'full-time': 'bg-green-100 text-green-800 border-green-200',
    'part-time': 'bg-sky-100 text-sky-800 border-sky-200',
    'contract': 'bg-violet-100 text-violet-800 border-violet-200',
    'freelance': 'bg-orange-100 text-orange-800 border-orange-200',
    'internship': 'bg-pink-100 text-pink-800 border-pink-200',
  };
  return map[type?.toLowerCase()] ?? 'bg-gray-100 text-gray-700 border-gray-200';
};

const experienceColor = (level: string) => {
  const map: Record<string, string> = {
    'entry': 'bg-teal-100 text-teal-800 border-teal-200',
    'mid': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'senior': 'bg-purple-100 text-purple-800 border-purple-200',
    'executive': 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return map[level?.toLowerCase()] ?? 'bg-gray-100 text-gray-700 border-gray-200';
};

const initials = (name: string) =>
  name
    .split(/[\s,]+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();

const companyColor = (name: string) => {
  const palette = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-sky-600',
  ];
  const idx = name.charCodeAt(0) % palette.length;
  return palette[idx];
};

// ── component ─────────────────────────────────────────────────────────────────

const JobCard: React.FC<JobCardProps> = ({ job, onSave, onViewDetails, isSaved = false }) => {
  const theme = scoreTheme(job.matchScore);
  const ai = job.aiAnalysis;
  const hasUrl = (job.originalUrl && job.originalUrl !== '#') || (job.url && job.url !== '#');
  const jobUrl = hasUrl ? (job.originalUrl ?? job.url) : undefined;
  const postedText = (job.postedDate || job.datePosted) ? formatDate((job.postedDate || job.datePosted)!) : 'Recently';

  // Skills to display: prefer structured requirements, Fall back to keywords minus the search-query blob
  const displaySkills = Array.isArray(job.requirements) && job.requirements.length > 0
    ? job.requirements.slice(0, 6)
    : [];

  const matchingSet = new Set((ai?.matchingSkills ?? []).map((s) => s.toLowerCase()));

  return (
    <div
      className={`relative flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 border-l-4 ${theme.border} overflow-hidden`}
    >
      {/* ── Top accent bar ── */}
      <div className={`h-1 w-full bg-gradient-to-r ${companyColor(job.company)}`} />

      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* ── Header row: logo + title + actions ── */}
        <div className="flex items-start gap-3">
          {/* Company avatar */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${companyColor(job.company)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
          >
            {initials(job.company)}
          </div>

          {/* Title + company */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold text-gray-900 leading-snug hover:text-blue-600 cursor-pointer line-clamp-2"
              onClick={() => onViewDetails?.(job)}
            >
              {job.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{job.company}</p>
          </div>

          {/* Match score ring */}
          {job.matchScore != null && (
            <div className={`flex-shrink-0 flex flex-col items-center justify-center rounded-full w-12 h-12 ${theme.badge} font-bold text-sm shadow`}>
              {job.matchScore}%
            </div>
          )}
        </div>

        {/* ── Meta row ── */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.location}
          </span>
          {(job.salary || job.salaryRange) && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {job.salary || job.salaryRange}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {postedText}
          </span>
          <span className="flex items-center gap-1">
            <Building className="w-3 h-3" />
            {job.source}
          </span>
        </div>

        {/* ── Badges ── */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${employmentColor(job.employmentType)}`}>
            {job.employmentType.replace('-', ' ')}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${experienceColor(job.experienceLevel)}`}>
            {job.experienceLevel}
          </span>
          {ai?.overallAssessment && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${theme.badge}`}>
              {ai.overallAssessment}
            </span>
          )}
        </div>

        {/* ── Description ── */}
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
          {job.description}
        </p>

        {/* ── Skills: show requirements, highlight matches in green ── */}
        {displaySkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displaySkills.map((skill, i) => {
              const isMatch = matchingSet.has(skill.toLowerCase());
              return (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    isMatch
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {isMatch && <span className="mr-0.5">✓</span>}
                  {skill}
                </span>
              );
            })}
            {Array.isArray(job.requirements) && job.requirements.length > 6 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded border border-gray-200">
                +{job.requirements.length - 6}
              </span>
            )}
          </div>
        )}

        {/* ── Missing skills (only shown for personalized results) ── */}
        {ai && ai.missingSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-gray-400 self-center">Missing:</span>
            {ai.missingSkills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-2 pt-2 border-t border-gray-100 mt-auto">
          <button
            onClick={() => onViewDetails?.(job)}
            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => onSave?.(job._id || job.id || job.originalUrl || job.url || '')}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved
                ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title={isSaved ? 'Remove from saved jobs' : 'Save job'}
            aria-pressed={isSaved}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <a
            href={jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1.5 rounded-lg transition-colors ${
              hasUrl ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50' : 'text-gray-200 cursor-not-allowed pointer-events-none'
            }`}
            title="Open original posting"
            onClick={(e) => { if (!hasUrl) e.preventDefault(); }}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default JobCard;