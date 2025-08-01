import { useState, useEffect } from "react";
import Header from "./Header";
import JobForm from "./JobForm";
import DistributionTable from "./DistributionTable";
import JobHistory from "./JobHistory";
import Dashboard from "./Dashboard";
import Dialog from "./Dialog";
import { useAuth } from "../contexts/AuthContext";
import { JobRecord, FormData } from "../types";
import { AdvancedPolicyFormData } from "../types/advanced-policy";
import jobService, { JobFormData } from "../services/jobService";
import { useDialog } from "../hooks/useDialog";
import { v4 as uuidv4 } from 'uuid';

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { dialogState, hideDialog, showError, showSuccess, showConfirm } = useDialog();
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [currentJob, setCurrentJob] = useState<JobRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "new" | "history">("dashboard");
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<{
    projectNames: string[];
    developerNames: string[];
  }>({ projectNames: [], developerNames: [] });

  // Load jobs on component mount
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
      console.error("Error loading jobs:", error);
      showError("Failed to load jobs");
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
      console.error("Error loading name suggestions:", error);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const jobData: JobFormData = {
        projectName: formData.projectName,
        paymentAmount: parseFloat(formData.paymentAmount),
        conversionRate: parseFloat(formData.conversionRate),
        frequency: formData.frequency,
        workingDev: formData.workingDev,
        communicatingDev: formData.communicatingDev || formData.workingDev,
        jobHunter: formData.jobHunter || formData.workingDev,
        companyPercentage: formData.companyPercentage,
        developerPercentage: formData.developerPercentage,
        jobHunterPercentage: formData.jobHunterPercentage,
        communicatorPercentage: formData.communicatorPercentage,
      };

      const response = await jobService.createJob(jobData);
      if (response.success) {
        const newJob = response.data;
        setJobs([newJob, ...jobs]);
        setCurrentJob(newJob);
        showSuccess("Job created successfully!");
        loadNameSuggestions();
      }
    } catch (error) {
      console.error("Error creating job:", error);
      showError("Failed to create job");
    }
  };

  const handleAdvancedPolicySubmit = async (formData: AdvancedPolicyFormData) => {
    try {
      // Calculate distribution
      const totalAmount = parseFloat(formData.paymentAmount);
      const companyAmount = (totalAmount * formData.companyPercentage) / 100;
      const developerBaseAmount = (totalAmount * formData.developerPercentage) / 100;
      
      let jobHunterAmount = 0;
      let communicatorAmount = 0;
      
      if (formData.jobHunter && formData.jobHunter !== formData.workingDev) {
        jobHunterAmount = (developerBaseAmount * formData.jobHunterPercentage) / 100;
      }
      
      if (formData.communicator && formData.communicator !== formData.workingDev) {
        communicatorAmount = (developerBaseAmount * formData.communicatorPercentage) / 100;
      }
      
      const finalDeveloperAmount = developerBaseAmount - jobHunterAmount - communicatorAmount;
      
      let totalInternAmount = 0;
      let finalDeveloperAfterIntern = finalDeveloperAmount;
      
      // Calculate total intern payments
      formData.interns.forEach(intern => {
        if (intern.type === 'fixed' && intern.amount) {
          // Convert PKR amount to USD for calculation
          const internAmountUSD = parseFloat(intern.amount) / parseFloat(formData.conversionRate);
          totalInternAmount += internAmountUSD;
        } else if (intern.type === 'percentage' && intern.percentage) {
          totalInternAmount += (finalDeveloperAmount * intern.percentage) / 100;
        }
      });
      
      finalDeveloperAfterIntern = finalDeveloperAmount - totalInternAmount;
      
      // Create a job record compatible with the existing DistributionTable
      const advancedJob: JobRecord = {
        id: uuidv4(),
        projectName: formData.projectName,
        paymentAmount: parseFloat(formData.paymentAmount),
        conversionRate: parseFloat(formData.conversionRate),
        frequency: formData.frequency,
        workingDev: formData.workingDev,
        communicatingDev: formData.communicator || formData.workingDev,
        jobHunter: formData.jobHunter || formData.workingDev,
        distribution: {
          company: companyAmount,
          workingDev: finalDeveloperAfterIntern,
          jobHunter: jobHunterAmount,
          communicator: communicatorAmount,
        },
        createdAt: new Date().toISOString(),
      };
      
      // Add interns to the job record if applicable
      if (formData.interns.length > 0 && totalInternAmount > 0) {
        // Store interns info in a custom property for display
        (advancedJob as JobRecord & { internsInfo: Array<{ name: string; amount: number; type: string; pkrAmount?: number }> }).internsInfo = formData.interns.map(intern => {
          if (intern.type === 'fixed') {
            const pkrAmount = parseFloat(intern.amount) || 0;
            const usdAmount = pkrAmount / parseFloat(formData.conversionRate);
            return {
              name: intern.name,
              amount: usdAmount, // USD amount for calculations
              type: intern.type,
              pkrAmount: pkrAmount // Original PKR amount for display
            };
          } else {
            const usdAmount = (finalDeveloperAmount * intern.percentage) / 100;
            return {
              name: intern.name,
              amount: usdAmount,
              type: intern.type,
              pkrAmount: usdAmount * parseFloat(formData.conversionRate)
            };
          }
        }).filter(intern => intern.amount > 0);
      }
      
      // Save to backend API for history tracking
      try {
        const jobData: JobFormData = {
          projectName: formData.projectName,
          paymentAmount: parseFloat(formData.paymentAmount),
          conversionRate: parseFloat(formData.conversionRate),
          frequency: formData.frequency,
          workingDev: formData.workingDev,
          communicatingDev: formData.communicator || formData.workingDev,
          jobHunter: formData.jobHunter || formData.workingDev,
          companyPercentage: formData.companyPercentage,
          developerPercentage: formData.developerPercentage,
          jobHunterPercentage: formData.jobHunterPercentage,
          communicatorPercentage: formData.communicatorPercentage,
          // Add advanced policy specific data
          advancedPolicy: {
            companyPercentage: formData.companyPercentage,
            developerPercentage: formData.developerPercentage,
            jobHunterPercentage: formData.jobHunterPercentage,
            communicatorPercentage: formData.communicatorPercentage,
            interns: formData.interns.map(intern => ({
              id: intern.id,
              name: intern.name,
              type: intern.type,
              amount: parseFloat(intern.amount) || 0,
              percentage: intern.percentage,
            })),
          }
        };
        
        console.log('App.tsx - Sending jobData to backend:', jobData);
        const response = await jobService.createJob(jobData);
        console.log('App.tsx - Backend response:', response);
        if (response.success) {
          const savedJob = response.data;
          console.log('App.tsx - Saved job from backend:', savedJob);
          // Update the jobs list with the saved job from backend
          setJobs([savedJob, ...jobs]);
          // Set the saved job as current job
          setCurrentJob(savedJob);
          // Refresh name suggestions
          loadNameSuggestions();
        } else {
          // If API save fails, still show the calculated result locally
          setCurrentJob(advancedJob);
          setJobs([advancedJob, ...jobs]);
        }
      } catch (error) {
        console.error('Error saving advanced policy job:', error);
        // If API save fails, still show the calculated result locally
        setCurrentJob(advancedJob);
        setJobs([advancedJob, ...jobs]);
      }
      
      showSuccess("Advanced policy job created successfully!");
    } catch (error) {
      console.error("Error creating advanced policy job:", error);
      showError("Failed to create advanced policy job");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const confirmed = await showConfirm(
      "Delete Job",
      "Are you sure you want to delete this job? This action cannot be undone."
    );

    if (confirmed) {
      try {
        const response = await jobService.deleteJob(jobId);
        if (response.success) {
          setJobs(jobs.filter((job) => job.id !== jobId));
          if (currentJob?.id === jobId) {
            setCurrentJob(null);
          }
          showSuccess("Job deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        showError("Failed to delete job");
      }
    }
  };



  const uniqueNames = [
    ...new Set([
      ...(nameSuggestions.developerNames || []),
      ...(nameSuggestions.projectNames || []),
    ]),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <Dashboard
            jobs={jobs}
            onNewJob={() => setActiveTab("new")}
            onViewHistory={() => setActiveTab("history")}
            isLoading={isLoadingJobs}
          />
        )}

        {activeTab === "new" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
            <JobForm
              onSubmit={handleSubmit}
              onAdvancedSubmit={handleAdvancedPolicySubmit}
              savedNames={uniqueNames}
            />
            {currentJob && (
              <DistributionTable
                job={currentJob}
                onExport={(job) => console.log("Export:", job)}
                onShare={(job) => console.log("Share:", job)}
              />
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Job History</h1>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
            <JobHistory
              jobs={jobs}
              onDeleteJob={handleDeleteJob}
            />
          </div>
        )}
      </main>

      <Dialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={dialogState.onConfirm}
        onCancel={hideDialog}
        onClose={hideDialog}
      />
    </div>
  );
};

export default DashboardPage;
