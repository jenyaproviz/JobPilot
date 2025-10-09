import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Briefcase, Github, Linkedin, Mail } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from './store';
import { jobsApi } from './services/api';
import JobSitesView from './components/JobSitesView';
import ContactForm from './components/ContactForm';

const AppContent: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [, setTotalSites] = useState(0);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  useEffect(() => {
    // Check server health on app load
    checkServerHealth();
    // Load job sites count for stats
    loadJobSitesStats();
  }, []);

  const checkServerHealth = async () => {
    try {
      await jobsApi.healthCheck();
      setServerStatus('online');
    } catch (error) {
      console.error('Server health check failed:', error);
      setServerStatus('offline');
    }
  };

  const loadJobSitesStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/job-sites/stats');
      const data = await response.json();
      if (data.success) {
        setTotalSites(data.data.totalSites);
      }
    } catch (error) {
      console.error('Error loading job sites stats:', error);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JobPilot</h1>
                <p className="text-xs text-gray-500">AI-Powered Job Search Agent</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Server Status Indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  serverStatus === 'online' ? 'bg-green-500' : 
                  serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-gray-600 capitalize">{serverStatus}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <a 
                  href="https://github.com/jenyaproviz?tab=repositories" 
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/jenya-proviz-katz/"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Server Offline Banner */}
        {serverStatus === 'offline' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <h3 className="font-medium text-red-900">Server Offline</h3>
            </div>
            <p className="text-red-700 text-sm mt-1">
              The JobPilot server is currently offline. Please start the server to use the job search features.
            </p>
            <button
              onClick={checkServerHealth}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Job Sites Directory */}
        <JobSitesView />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">JobPilot</p>
                <p className="text-sm text-gray-600">AI-Powered Job Search Agent</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsContactFormOpen(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Contact</span>
              </button>
              <p className="text-sm text-gray-500">
                © 2025 JobPilot. Built with React, TypeScript & AI.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={isContactFormOpen} 
        onClose={() => setIsContactFormOpen(false)} 
      />

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
