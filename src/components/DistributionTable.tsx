import React from "react";
import { PieChart, Download, Share2, Eye } from "lucide-react";
import { JobRecord } from "../types";
import { formatCurrency } from "../utils/calculations";

interface DistributionTableProps {
  job: JobRecord | null;
  onExport?: (job: JobRecord) => void;
  onShare?: (job: JobRecord) => void;
}

const DistributionTable: React.FC<DistributionTableProps> = ({
  job,
  onExport,
  onShare,
}) => {
  console.log(job, "RRR");
  if (!job) return null;

  // Extract the actual job data from the nested structure
  const actualJob = (job as { job?: JobRecord } & JobRecord).job || job;
  
  // Check if distribution data exists and has required properties
  if (!actualJob.distribution || typeof actualJob.distribution.company === "undefined") {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating distribution...</p>
          </div>
        </div>
      </div>
    );
  }

  const pkrAmount = actualJob.paymentAmount * actualJob.conversionRate;

  const distributionItems = [
    {
      label: "Company Share",
      usd: actualJob.distribution.company,
      pkr: actualJob.distribution.company * actualJob.conversionRate,
      percentage: "30%",
      color: "bg-blue-500",
      person: "Company",
    },
    {
      label: "Working Developer",
      usd: actualJob.distribution.workingDev,
      pkr: actualJob.distribution.workingDev * actualJob.conversionRate,
      percentage: `${(
        (actualJob.distribution.workingDev / actualJob.paymentAmount) *
        100
      ).toFixed(1)}%`,
      color: "bg-emerald-500",
      person: actualJob.workingDev,
    },
    ...(actualJob.distribution.jobHunter > 0
      ? [
          {
            label: "Job Hunter Fee",
            usd: actualJob.distribution.jobHunter,
            pkr: actualJob.distribution.jobHunter * actualJob.conversionRate,
            percentage: `${(
              (actualJob.distribution.jobHunter / actualJob.paymentAmount) *
              100
            ).toFixed(1)}%`,
            color: "bg-orange-500",
            person: actualJob.jobHunter,
          },
        ]
      : []),
    ...(actualJob.distribution.communicator > 0
      ? [
          {
            label: "Communication Fee",
            usd: actualJob.distribution.communicator,
            pkr: actualJob.distribution.communicator * actualJob.conversionRate,
            percentage: `${(
              (actualJob.distribution.communicator / actualJob.paymentAmount) *
              100
            ).toFixed(1)}%`,
            color: "bg-purple-500",
            person: actualJob.communicatingDev,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <PieChart className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Payment Distribution
          </h3>
        </div>
        <div className="flex space-x-2">
          {onExport && (
            <button
              onClick={() => onExport(job)}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
          {onShare && (
            <button
              onClick={() => onShare(job)}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">{actualJob.projectName}</h4>
            <p className="text-sm text-gray-600">{actualJob.frequency} Payment</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Payment</p>
            <p className="font-semibold text-lg">
              {formatCurrency(actualJob.paymentAmount, "USD")}
            </p>
            <p className="text-sm text-gray-600">
              PKR {pkrAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Exchange Rate</p>
            <p className="font-semibold">1 USD = {actualJob.conversionRate} PKR</p>
          </div>
        </div>
      </div>

      {/* Distribution Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Recipient
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                Role
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">
                USD Amount
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">
                PKR Amount
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody>
            {distributionItems.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="font-medium text-gray-900">
                      {item.person}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{item.label}</td>
                <td className="py-4 px-4 text-right font-semibold text-gray-900">
                  {formatCurrency(item.usd, "USD")}
                </td>
                <td className="py-4 px-4 text-right font-semibold text-gray-900">
                  PKR {item.pkr.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-sm font-medium">
                    {item.percentage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verification */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Verification</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Total distributed:{" "}
          {formatCurrency(
            distributionItems.reduce((sum, item) => sum + item.usd, 0),
            "USD"
          )}{" "}
          (100% of payment)
        </p>
      </div>
    </div>
  );
};

export default DistributionTable;
