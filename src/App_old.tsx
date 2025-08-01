import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardPage from "./components/DashboardPage";
import JobDetails from "./components/JobDetails";
import Login from "./components/Login";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/:id" element={<JobDetails />} />
      </Routes>
    </Router>
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
      console.error("Failed to load jobs:", error);
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
      console.error("Failed to load name suggestions:", error);
    }
  };

  const handleJobSubmit = async (formData: FormData) => {
    try {
      const jobData: JobFormData = {
        projectName: formData.projectName,
        paymentAmount: parseFloat(formData.paymentAmount),
        conversionRate: parseFloat(formData.conversionRate),
        frequency: formData.frequency as
          | "One-time"
          | "Weekly"
          | "Bi-weekly"
          | "Monthly",
        workingDev: formData.workingDev,
        communicatingDev: formData.communicatingDev || formData.workingDev,
        jobHunter: formData.jobHunter || formData.workingDev,
      };

      const response = await jobService.createJob(jobData);
      if (response.success) {
        const newJob = response.data;
        setJobs([newJob, ...jobs]);
        setCurrentJob(newJob);
        setActiveTab("new");
        // Refresh name suggestions
        loadNameSuggestions();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create job";
      console.error("Failed to create job:", error);
      showError("Error Creating Job", errorMessage);
    }
  };

  const handleAdvancedPolicySubmit = async (formData: AdvancedPolicyFormData) => {
    try {
      // Calculate distribution based on advanced policy rules
      const totalAmount = parseFloat(formData.paymentAmount);
      const companyAmount = (totalAmount * formData.companyPercentage) / 100;
      const developerBaseAmount = (totalAmount * formData.developerPercentage) / 100;
      
      let jobHunterAmount = 0;
      let communicatorAmount = 0;
      
      // Job hunter gets percentage only if different from working developer
      if (formData.jobHunter && formData.jobHunter !== formData.workingDev) {
        jobHunterAmount = (developerBaseAmount * formData.jobHunterPercentage) / 100;
      }
      
      // Communicator gets percentage only if different from working developer
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
        paymentAmount: totalAmount,
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
          paymentAmount: totalAmount,
          conversionRate: parseFloat(formData.conversionRate),
          frequency: formData.frequency,
          workingDev: formData.workingDev,
          communicatingDev: formData.communicator || formData.workingDev,
          jobHunter: formData.jobHunter || formData.workingDev,
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
          showError("Warning", "Advanced policy calculated but not saved to history. Please check your connection.");
        }
      } catch (apiError) {
        console.error("Failed to save to API:", apiError);
        // If API save fails, still show the calculated result locally
        setCurrentJob(advancedJob);
        setJobs([advancedJob, ...jobs]);
        showError("Warning", "Advanced policy calculated but not saved to history. Please check your connection.");
      }
      
      setActiveTab("new");
      showSuccess("Success", "Advanced policy calculated successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to calculate advanced policy";
      console.error("Failed to calculate advanced policy:", error);
      showError("Error Calculating Policy", errorMessage);
    }
  };

  const handleViewJob = (job: JobRecord) => {
    setCurrentJob(job);
    setActiveTab("new");
  };

  const handleDeleteJob = async (jobId: string) => {
    showConfirm(
      "Delete Job",
      "Are you sure you want to delete this job record? This action cannot be undone.",
      async () => {
        try {
          const response = await jobService.deleteJob(jobId);
          if (response.success) {
            setJobs(jobs.filter((job) => job.id !== jobId));
            if (currentJob?.id === jobId) {
              setCurrentJob(null);
            }
            showSuccess("Success", "Job deleted successfully!");
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete job";
          console.error("Failed to delete job:", error);
          showError("Error Deleting Job", errorMessage);
        }
      }
    );
  };

  const handleExport = (job: JobRecord) => {
    const csvData = [
      ["Project", "Role", "Person", "USD Amount", "PKR Amount", "Percentage"],
      [
        "Developer Share",
        "Working Developer",
        job.workingDev,
        job.distribution.workingDev,
        job.distribution.workingDev * job.conversionRate,
        `${((job.distribution.workingDev / job.paymentAmount) * 100).toFixed(
          1
        )}%`,
      ],
      ...(job.distribution.jobHunter > 0
        ? [
            [
              "Job Hunter Fee",
              "Job Hunter",
              job.jobHunter,
              job.distribution.jobHunter,
              job.distribution.jobHunter * job.conversionRate,
              `${(
                (job.distribution.jobHunter / job.paymentAmount) *
                100
              ).toFixed(1)}%`,
            ],
          ]
        : []),
      ...(job.distribution.communicator > 0
        ? [
            [
              "Communication Fee",
              "Communicator",
              job.communicatingDev,
              job.distribution.communicator,
              job.distribution.communicator * job.conversionRate,
              `${(
                (job.distribution.communicator / job.paymentAmount) *
                100
              ).toFixed(1)}%`,
            ],
          ]
        : []),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${job.projectName}_distribution.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShare = (job: JobRecord) => {
    const shareText = `Payment Distribution for ${job.projectName}:
${job.workingDev}: $${job.distribution.workingDev.toFixed(2)}
${
  job.distribution.jobHunter > 0
    ? `${job.jobHunter}: $${job.distribution.jobHunter.toFixed(2)}`
    : ""
}
${
  job.distribution.communicator > 0
    ? `${job.communicatingDev}: $${job.distribution.communicator.toFixed(2)}`
    : ""
}
Total: $${job.paymentAmount}`;

    if (navigator.share) {
      navigator.share({
        title: `Payment Distribution - ${job.projectName}`,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      showSuccess("Success", "Distribution details copied to clipboard!");
    }
  };

  const savedNames = [
    ...(nameSuggestions?.developerNames || []),
    ...Array.from(
      new Set([
        ...jobs.map((job) => job.workingDev),
        ...jobs.map((job) => job.jobHunter),
        ...jobs.map((job) => job.communicatingDev),
      ])
    ).filter((name) => name && name.trim() !== ""),
  ];

  const tabs = [
    { id: "dashboard", label: "Dashboard", show: jobs.length > 0 },
    { id: "new", label: "Project" },
    { id: "history", label: "History", show: jobs.length > 0 },
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
          {tabs
            .filter((tab) => tab.show !== false)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "dashboard" | "new" | "history")
                }
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <Dashboard jobs={jobs} />}

        {activeTab === "new" && (
          <div>
            <JobForm 
              onSubmit={handleJobSubmit} 
              onAdvancedSubmit={handleAdvancedPolicySubmit}
              savedNames={savedNames} 
            />
            <DistributionTable
              job={currentJob}
              onExport={handleExport}
              onShare={handleShare}
            />
          </div>
        )}

        {activeTab === "history" && (
          <JobHistory
            jobs={jobs}
            onViewJob={handleViewJob}
            onDeleteJob={handleDeleteJob}
          />
        )}
      </main>

      {/* Dialog Component */}
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={hideDialog}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
        onCancel={dialogState.onCancel}
        showCancel={dialogState.showCancel}
      />
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
