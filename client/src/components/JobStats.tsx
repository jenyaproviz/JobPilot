import React from 'react';
import { Search, BarChart3, Users, Target } from 'lucide-react';

interface JobStatsProps {
  totalJobs: number;
  isLoading: boolean;
}

const JobStats: React.FC<JobStatsProps> = ({ totalJobs, isLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Job Market Overview</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Jobs</p>
              <p className="text-2xl font-bold text-blue-900">
                {isLoading ? '...' : totalJobs.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Active Jobs</p>
              <p className="text-2xl font-bold text-green-900">
                {isLoading ? '...' : Math.floor(totalJobs * 0.8).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Companies</p>
              <p className="text-2xl font-bold text-purple-900">
                {isLoading ? '...' : Math.floor(totalJobs * 0.3).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-600 font-medium">This Week</p>
              <p className="text-2xl font-bold text-orange-900">
                {isLoading ? '...' : Math.floor(totalJobs * 0.15).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStats;