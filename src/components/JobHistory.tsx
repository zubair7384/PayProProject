import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Trash2,
} from "lucide-react";
import { JobRecord } from "../types";
import { formatCurrency } from "../utils/calculations";

interface JobHistoryProps {
  jobs: JobRecord[];
  onDeleteJob: (jobId: string) => void;
}

const JobHistory: React.FC<JobHistoryProps> = ({ jobs, onDeleteJob }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("All");

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.workingDev.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobHunter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.communicatingDev.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFrequency =
      selectedFrequency === "All" || job.frequency === selectedFrequency;

    return matchesSearch && matchesFrequency;
  });

  const totalEarnings = jobs.reduce((sum, job) => sum + job.paymentAmount, 0);
  const totalJobs = jobs.length;

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Job History
        </h3>
        <p className="text-gray-600">
          Start by adding your first job to see the distribution history here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <History className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Job History</h3>
        </div>
        <div className="text-sm text-gray-600">
          {totalJobs} jobs • {formatCurrency(totalEarnings, "USD")} total
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, developers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Frequencies</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {job.projectName}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(job.paymentAmount, "USD")}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {job.frequency}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/${job.id}`)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => onDeleteJob(job.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete job"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Working Dev:</span>
                <p className="font-medium">{job.workingDev}</p>
              </div>
              {job.jobHunter && (
                <div>
                  <span className="text-gray-600">Job Hunter:</span>
                  <p className="font-medium">{job.jobHunter}</p>
                </div>
              )}
              {job.communicatingDev &&
                job.communicatingDev !== job.workingDev && (
                  <div>
                    <span className="text-gray-600">Communicator:</span>
                    <p className="font-medium">{job.communicatingDev}</p>
                  </div>
                )}
              <div>
                <span className="text-gray-600">Dev Share:</span>
                <p className="font-medium text-green-600">
                  {formatCurrency(job.distribution.workingDev, "USD")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No jobs found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobHistory;
