import { useState, useEffect } from 'react';
import Header from './components/Header';
import JobForm from './components/JobForm';
import DistributionTable from './components/DistributionTable';
import JobHistory from './components/JobHistory';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { JobRecord, FormData } from './types';
import jobService, { JobFormData } from './services/jobService';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [currentJob, setCurrentJob] = useState<JobRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new' | 'history'>('dashboard');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<{ projectNames: string[]; developerNames: string[] }>({ projectNames: [], developerNames: [] });

  // Load jobs from backend when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
      loadNameSuggestions();
    }
  }, [isAuthenticated]);

  const loadJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const response = await jobService.getJobs();
      if (response.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadNameSuggestions = async () => {
    try {
      const response = await jobService.getNameSuggestions();
      if (response.success) {
        setNameSuggestions(response.data);
      }
    } catch (error) {
      console.error('Failed to load name suggestions:', error);
    }
  };

  const handleJobSubmit = async (formData: FormData) => {
    try {
      const jobData: JobFormData = {
        projectName: formData.projectName,
        paymentAmount: parseFloat(formData.paymentAmount),
        conversionRate: parseFloat(formData.conversionRate),
        frequency: formData.frequency as 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly',
        workingDev: formData.workingDev,
        communicatingDev: formData.communicatingDev || formData.workingDev,
        jobHunter: formData.jobHunter || formData.workingDev,
      };

      const response = await jobService.createJob(jobData);
      if (response.success) {
        const newJob = response.data;
        setJobs([newJob, ...jobs]);
        setCurrentJob(newJob);
        setActiveTab('new');
        // Refresh name suggestions
        loadNameSuggestions();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create job';
      console.error('Failed to create job:', error);
      alert(errorMessage);
    }
  };

  const handleViewJob = (job: JobRecord) => {
    setCurrentJob(job);
    setActiveTab('new');
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job record?')) {
      try {
        const response = await jobService.deleteJob(jobId);
        if (response.success) {
          setJobs(jobs.filter(job => job.id !== jobId));
          if (currentJob?.id === jobId) {
            setCurrentJob(null);
          }
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete job';
        console.error('Failed to delete job:', error);
        alert(errorMessage);
      }
    }
  };

  const handleExport = (job: JobRecord) => {
    const csvData = [
      ['Project', 'Role', 'Person', 'USD Amount', 'PKR Amount', 'Percentage'],
      ['Developer Share', 'Working Developer', job.workingDev, job.distribution.workingDev, job.distribution.workingDev * job.conversionRate, `${((job.distribution.workingDev / job.paymentAmount) * 100).toFixed(1)}%`],
      ...(job.distribution.jobHunter > 0 ? [['Job Hunter Fee', 'Job Hunter', job.jobHunter, job.distribution.jobHunter, job.distribution.jobHunter * job.conversionRate, `${((job.distribution.jobHunter / job.paymentAmount) * 100).toFixed(1)}%`]] : []),
      ...(job.distribution.communicatingDev > 0 ? [['Communication Fee', 'Communicator', job.communicatingDev, job.distribution.communicatingDev, job.distribution.communicatingDev * job.conversionRate, `${((job.distribution.communicatingDev / job.paymentAmount) * 100).toFixed(1)}%`]] : []),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.projectName}_distribution.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShare = (job: JobRecord) => {
    const shareText = `Payment Distribution for ${job.projectName}:
${job.workingDev}: $${job.distribution.workingDev.toFixed(2)}
${job.distribution.jobHunter > 0 ? `${job.jobHunter}: $${job.distribution.jobHunter.toFixed(2)}` : ''}
${job.distribution.communicatingDev > 0 ? `${job.communicatingDev}: $${job.distribution.communicatingDev.toFixed(2)}` : ''}
Total: $${job.paymentAmount}`;

    if (navigator.share) {
      navigator.share({
        title: `Payment Distribution - ${job.projectName}`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Distribution details copied to clipboard!');
    }
  };

  const savedNames = [
    ...(nameSuggestions?.developerNames || []),
    ...Array.from(new Set([
      ...jobs.map(job => job.workingDev),
      ...jobs.map(job => job.jobHunter),
      ...jobs.map(job => job.communicatingDev),
    ])).filter(name => name && name.trim() !== '')
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', show: jobs.length > 0 },
    { id: 'new', label: 'New Job' },
    { id: 'history', label: 'History', show: jobs.length > 0 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading indicator */}
        {isLoadingJobs && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm">
          {tabs.filter(tab => tab.show !== false).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'dashboard' | 'new' | 'history')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && <Dashboard jobs={jobs} />}
        
        {activeTab === 'new' && (
          <div>
            <JobForm onSubmit={handleJobSubmit} savedNames={savedNames} />
            <DistributionTable 
              job={currentJob} 
              onExport={handleExport}
              onShare={handleShare}
            />
          </div>
        )}
        
        {activeTab === 'history' && (
          <JobHistory 
            jobs={jobs} 
            onViewJob={handleViewJob}
            onDeleteJob={handleDeleteJob}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;