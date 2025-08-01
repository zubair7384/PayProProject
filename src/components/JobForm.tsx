import React, { useState } from "react";
import {
  Plus,
  DollarSign,
  Users,
  Clock,
  Settings,
  FileText,
  X,
  UserPlus,
} from "lucide-react";
import { FormData } from "../types";
import { AdvancedPolicyFormData } from "../types/advanced-policy";
import { v4 as uuidv4 } from "uuid";

interface JobFormProps {
  onSubmit: (data: FormData) => void;
  onAdvancedSubmit?: (data: AdvancedPolicyFormData) => void;
  savedNames: string[];
}

const JobForm: React.FC<JobFormProps> = ({
  onSubmit,
  onAdvancedSubmit,
  savedNames,
}) => {
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    paymentAmount: "",
    conversionRate: "278",
    frequency: "Monthly",
    communicatingDev: "",
    jobHunter: "",
    workingDev: "",
  });

  const [advancedFormData, setAdvancedFormData] = useState({
    projectName: "",
    paymentAmount: "",
    conversionRate: "278",
    frequency: "Monthly" as "One-time" | "Weekly" | "Bi-weekly" | "Monthly",
    workingDev: "",
    jobHunter: "",
    communicator: "",
    companyPercentage: 30,
    developerPercentage: 70,
    jobHunterPercentage: 5,
    communicatorPercentage: 10,
    interns: [] as Array<{
      id: string;
      name: string;
      type: "fixed" | "percentage";
      amount: string;
      percentage: number;
    }>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      newErrors.paymentAmount = "Valid payment amount is required";
    }

    if (!formData.conversionRate || parseFloat(formData.conversionRate) <= 0) {
      newErrors.conversionRate = "Valid conversion rate is required";
    }

    if (!formData.workingDev.trim()) {
      newErrors.workingDev = "Working developer name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        projectName: "",
        paymentAmount: "",
        conversionRate: "278",
        frequency: "Monthly",
        communicatingDev: "",
        jobHunter: "",
        workingDev: "",
      });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAdvancedInputChange = (
    field: keyof AdvancedPolicyFormData,
    value:
      | string
      | number
      | Array<{
          id: string;
          name: string;
          type: "fixed" | "percentage";
          amount: string;
          percentage: number;
        }>
  ) => {
    setAdvancedFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAdvancedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate advanced form
    const newErrors: Record<string, string> = {};
    if (!advancedFormData.projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }
    if (
      !advancedFormData.paymentAmount ||
      parseFloat(advancedFormData.paymentAmount) <= 0
    ) {
      newErrors.paymentAmount = "Valid payment amount is required";
    }
    if (!advancedFormData.workingDev.trim()) {
      newErrors.workingDev = "Working developer name is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Call the onAdvancedSubmit callback to generate the result table
      if (onAdvancedSubmit) {
        onAdvancedSubmit(advancedFormData);
      }

      // Reset form
      setAdvancedFormData({
        projectName: "",
        paymentAmount: "",
        conversionRate: "278",
        frequency: "Monthly",
        workingDev: "",
        jobHunter: "",
        communicator: "",
        companyPercentage: 30,
        developerPercentage: 70,
        jobHunterPercentage: 5,
        communicatorPercentage: 10,
        interns: [],
      });
      setErrors({});
    }
  };

  const uniqueNames = Array.from(new Set(savedNames)).filter(
    (name) => name.trim() !== ""
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-2 mb-6">
        <Plus className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Add New</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("basic")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "basic"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Basic Policy</span>
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "advanced"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Advanced Policy</span>
        </button>
      </div>

      {activeTab === "basic" ? (
        <BasicPolicyForm
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          uniqueNames={uniqueNames}
        />
      ) : (
        <AdvancedPolicyForm
          formData={advancedFormData}
          errors={errors}
          handleInputChange={handleAdvancedInputChange}
          handleSubmit={handleAdvancedSubmit}
          uniqueNames={uniqueNames}
        />
      )}
    </div>
  );
};

// Basic Policy Form Component
const BasicPolicyForm: React.FC<{
  formData: FormData;
  errors: Record<string, string>;
  handleInputChange: (field: keyof FormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  uniqueNames: string[];
}> = ({ formData, errors, handleInputChange, handleSubmit, uniqueNames }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => handleInputChange("projectName", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.projectName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter project name"
          />
          {errors.projectName && (
            <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
          )}
        </div>

        {/* Payment Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Payment Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.paymentAmount}
            onChange={(e) => handleInputChange("paymentAmount", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.paymentAmount ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0.00"
          />
          {errors.paymentAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
          )}
        </div>

        {/* Conversion Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversion Rate (USD → PKR)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.conversionRate}
            onChange={(e) =>
              handleInputChange("conversionRate", e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.conversionRate ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="278.00"
          />
          {errors.conversionRate && (
            <p className="mt-1 text-sm text-red-600">{errors.conversionRate}</p>
          )}
        </div>

        {/* Payment Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Payment Frequency
          </label>
          <select
            value={formData.frequency}
            onChange={(e) =>
              handleInputChange(
                "frequency",
                e.target.value as "Daily" | "Weekly" | "Monthly"
              )
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Team Members */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Working Developer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Developer *
            </label>
            <input
              type="text"
              list="workingDevList"
              value={formData.workingDev}
              onChange={(e) => handleInputChange("workingDev", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.workingDev ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter developer name"
            />
            <datalist id="workingDevList">
              {uniqueNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
            {errors.workingDev && (
              <p className="mt-1 text-sm text-red-600">{errors.workingDev}</p>
            )}
          </div>

          {/* Job Hunter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Hunter
              <span className="text-gray-500 text-xs ml-1">
                (5% if different)
              </span>
            </label>
            <input
              type="text"
              list="jobHunterList"
              value={formData.jobHunter}
              onChange={(e) => handleInputChange("jobHunter", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter job hunter name (optional)"
            />
            <datalist id="jobHunterList">
              {uniqueNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
          </div>

          {/* Communicating Developer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communicator
              <span className="text-gray-500 text-xs ml-1">
                (10% if different)
              </span>
            </label>
            <input
              type="text"
              list="communicatorList"
              value={formData.communicatingDev}
              onChange={(e) =>
                handleInputChange("communicatingDev", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter communicator name (optional)"
            />
            <datalist id="communicatorList">
              {uniqueNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Calculate Distribution
        </button>
      </div>
    </form>
  );
};

// Advanced Policy Form Component
const AdvancedPolicyForm: React.FC<{
  formData: AdvancedPolicyFormData;
  errors: Record<string, string>;
  handleInputChange: (
    field: keyof AdvancedPolicyFormData,
    value:
      | string
      | number
      | Array<{
          id: string;
          name: string;
          type: "fixed" | "percentage";
          amount: string;
          percentage: number;
        }>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  uniqueNames: string[];
}> = ({ formData, errors, handleInputChange, handleSubmit, uniqueNames }) => {
  // Intern management functions
  const addIntern = () => {
    const newIntern = {
      id: uuidv4(),
      name: "",
      type: "fixed" as "fixed" | "percentage",
      amount: "",
      percentage: 10,
    };
    handleInputChange("interns", [...formData.interns, newIntern]);
  };

  const removeIntern = (internId: string) => {
    const updatedInterns = formData.interns.filter(
      (intern) => intern.id !== internId
    );
    handleInputChange("interns", updatedInterns);
  };

  const updateIntern = (
    internId: string,
    field: string,
    value: string | number
  ) => {
    const updatedInterns = formData.interns.map((intern) => {
      if (intern.id === internId) {
        return { ...intern, [field]: value };
      }
      return intern;
    });
    handleInputChange("interns", updatedInterns);
  };

  const calculateDistribution = () => {
    const totalAmount = parseFloat(formData.paymentAmount) || 0;
    const companyAmount = (totalAmount * formData.companyPercentage) / 100;
    const developerBaseAmount =
      (totalAmount * formData.developerPercentage) / 100;

    let jobHunterAmount = 0;
    let communicatorAmount = 0;

    if (formData.jobHunter && formData.jobHunter !== formData.workingDev) {
      jobHunterAmount =
        (developerBaseAmount * formData.jobHunterPercentage) / 100;
    }

    if (
      formData.communicator &&
      formData.communicator !== formData.workingDev
    ) {
      communicatorAmount =
        (developerBaseAmount * formData.communicatorPercentage) / 100;
    }

    const finalDeveloperAmount =
      developerBaseAmount - jobHunterAmount - communicatorAmount;

    let totalInternAmount = 0;
    let finalDeveloperAfterIntern = finalDeveloperAmount;

    // Calculate total intern payments
    formData.interns.forEach((intern) => {
      if (intern.type === "fixed" && intern.amount) {
        totalInternAmount += parseFloat(intern.amount);
      } else if (intern.type === "percentage" && intern.percentage) {
        totalInternAmount += (finalDeveloperAmount * intern.percentage) / 100;
      }
    });

    finalDeveloperAfterIntern = finalDeveloperAmount - totalInternAmount;

    return {
      company: companyAmount,
      developer: finalDeveloperAfterIntern,
      jobHunter: jobHunterAmount,
      communicator: communicatorAmount,
      intern: totalInternAmount,
      total: totalAmount,
    };
  };

  const distribution = calculateDistribution();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => handleInputChange("projectName", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.projectName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter project name"
          />
          {errors.projectName && (
            <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Payment Amount (USD)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.paymentAmount}
            onChange={(e) => handleInputChange("paymentAmount", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.paymentAmount ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0.00"
          />
          {errors.paymentAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversion Rate (USD → PKR)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.conversionRate}
            onChange={(e) =>
              handleInputChange("conversionRate", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="278.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline h-4 w-4 mr-1" />
            Payment Frequency
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => handleInputChange("frequency", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="One-time">One-time</option>
            <option value="Weekly">Weekly</option>
            <option value="Bi-weekly">Bi-weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Distribution Percentages */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Distribution Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Percentage
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.companyPercentage}
              onChange={(e) =>
                handleInputChange("companyPercentage", parseInt(e.target.value))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Developer Base Percentage
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.developerPercentage}
              onChange={(e) =>
                handleInputChange(
                  "developerPercentage",
                  parseInt(e.target.value)
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Fixed percentages info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Fixed Distribution Rules:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Job Hunter receives 5% from developer's share (if different
              person)
            </li>
            <li>
              • Communicator receives 10% from developer's share (if different
              person)
            </li>
            <li>• Remaining amount goes to the working developer</li>
          </ul>
        </div>
      </div>

      {/* Team Members */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Developer *
            </label>
            <input
              type="text"
              list="workingDevAdvancedList"
              value={formData.workingDev}
              onChange={(e) => handleInputChange("workingDev", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.workingDev ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter developer name"
            />
            <datalist id="workingDevAdvancedList">
              {uniqueNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
            {errors.workingDev && (
              <p className="mt-1 text-sm text-red-600">{errors.workingDev}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Hunter
            </label>
            <input
              type="text"
              list="jobHunterAdvancedList"
              value={formData.jobHunter}
              onChange={(e) => handleInputChange("jobHunter", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter job hunter name (optional)"
            />
            <datalist id="jobHunterAdvancedList">
              {uniqueNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Communicator
            </label>
            <input
              type="text"
              list="communicatorAdvancedList"
              value={formData.communicator}
              onChange={(e) =>
                handleInputChange("communicator", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter communicator name (optional)"
            />
            <datalist id="communicatorAdvancedList">
              {uniqueNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      {/* Intern Management */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Intern Management
          </h3>
          <button
            type="button"
            onClick={addIntern}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Intern</span>
          </button>
        </div>

        {formData.interns.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No interns added yet</p>
            <p className="text-sm text-gray-400">
              Click "Add Intern" to start managing intern payments
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.interns.map((intern, index) => (
              <div key={intern.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Intern {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeIntern(intern.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intern Name
                    </label>
                    <input
                      type="text"
                      value={intern.name}
                      onChange={(e) =>
                        updateIntern(intern.id, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter intern name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <select
                      value={intern.type}
                      onChange={(e) =>
                        updateIntern(
                          intern.id,
                          "type",
                          e.target.value as "fixed" | "percentage"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>

                  <div>
                    {intern.type === "fixed" ? (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fixed Amount (PKR)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={intern.amount}
                          onChange={(e) =>
                            updateIntern(intern.id, "amount", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="0.00"
                        />
                      </>
                    ) : (
                      <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Percentage (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={intern.percentage}
                          onChange={(e) =>
                            updateIntern(
                              intern.id,
                              "percentage",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="10"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Distribution Preview */}
      {formData.paymentAmount && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribution Preview
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Total Amount:</span>
              <span>${distribution.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Company ({formData.companyPercentage}%):</span>
              <span>${distribution.company.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Developer (final):</span>
              <span>${distribution.developer.toFixed(2)}</span>
            </div>
            {distribution.jobHunter > 0 && (
              <div className="flex justify-between">
                <span>Job Hunter ({formData.jobHunterPercentage}%):</span>
                <span>${distribution.jobHunter.toFixed(2)}</span>
              </div>
            )}
            {distribution.communicator > 0 && (
              <div className="flex justify-between">
                <span>Communicator ({formData.communicatorPercentage}%):</span>
                <span>${distribution.communicator.toFixed(2)}</span>
              </div>
            )}
            {distribution.intern > 0 && (
              <div className="flex justify-between">
                <span>Intern:</span>
                <span>PKR{distribution.intern.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Save Advanced Policy
        </button>
      </div>
    </form>
  );
};

export default JobForm;
