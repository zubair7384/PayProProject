import React, { useState } from 'react';
import { Plus, DollarSign, Users, Clock } from 'lucide-react';
import { FormData } from '../types';

interface JobFormProps {
  onSubmit: (data: FormData) => void;
  savedNames: string[];
}

const JobForm: React.FC<JobFormProps> = ({ onSubmit, savedNames }) => {
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    paymentAmount: '',
    conversionRate: '278',
    frequency: 'Monthly',
    communicatingDev: '',
    jobHunter: '',
    workingDev: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
      newErrors.paymentAmount = 'Valid payment amount is required';
    }

    if (!formData.conversionRate || parseFloat(formData.conversionRate) <= 0) {
      newErrors.conversionRate = 'Valid conversion rate is required';
    }

    if (!formData.workingDev.trim()) {
      newErrors.workingDev = 'Working developer name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        projectName: '',
        paymentAmount: '',
        conversionRate: '278',
        frequency: 'Monthly',
        communicatingDev: '',
        jobHunter: '',
        workingDev: '',
      });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const uniqueNames = Array.from(new Set(savedNames)).filter(name => name.trim() !== '');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-2 mb-6">
        <Plus className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Add New Job</h2>
      </div>

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
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.projectName ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.paymentAmount ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => handleInputChange('conversionRate', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.conversionRate ? 'border-red-500' : 'border-gray-300'
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
              onChange={(e) => handleInputChange('frequency', e.target.value as 'Daily' | 'Weekly' | 'Monthly')}
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
                onChange={(e) => handleInputChange('workingDev', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.workingDev ? 'border-red-500' : 'border-gray-300'
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
                <span className="text-gray-500 text-xs ml-1">(5% if different)</span>
              </label>
              <input
                type="text"
                list="jobHunterList"
                value={formData.jobHunter}
                onChange={(e) => handleInputChange('jobHunter', e.target.value)}
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
                <span className="text-gray-500 text-xs ml-1">(10% if different)</span>
              </label>
              <input
                type="text"
                list="communicatorList"
                value={formData.communicatingDev}
                onChange={(e) => handleInputChange('communicatingDev', e.target.value)}
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
    </div>
  );
};

export default JobForm;