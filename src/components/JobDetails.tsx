import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { JobRecord } from "../types";
import DistributionTable from "./DistributionTable";
import jobService from "../services/jobService";

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) {
        setError("Job ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await jobService.getJobById(id);
        if (response.success) {
          setJob(response?.data?.job);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate("/");
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (loading || error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {loading ? "Loading..." : "Job Not Found"}
            </h2>
            <p className="text-gray-600 mb-6">
              {loading
                ? "Please wait while we load the job details."
                : error || "The requested job could not be found."}
            </p>
            {!loading && (
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm border"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Job Details Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {job.projectName}
              </h1>
              <p className="text-gray-600 mt-1">
                Created on {new Date(job.createdAt).toLocaleDateString()} •{" "}
                {job.frequency} Payment
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ${job?.paymentAmount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                PKR{" "}
                {(job?.paymentAmount * job?.conversionRate).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Distribution Table */}
        <DistributionTable
          job={job}
          onExport={() => {
            // Export functionality can be implemented here
            console.log("Export job:", job.id);
          }}
          onShare={() => {
            // Share functionality - copy current URL to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("Job details URL copied to clipboard!");
          }}
        />
      </div>
    </div>
  );
};

export default JobDetails;
