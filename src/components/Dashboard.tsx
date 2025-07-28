import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { JobRecord } from '../types';
import { formatCurrency } from '../utils/calculations';

interface DashboardProps {
  jobs: JobRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ jobs }) => {
  if (jobs.length === 0) return null;

  const totalRevenue = jobs.reduce((sum, job) => sum + job.paymentAmount, 0);
  const companyEarnings = jobs.reduce((sum, job) => sum + job.distribution.company, 0);
  const developerEarnings = jobs.reduce((sum, job) => sum + job.distribution.workingDev, 0);
  
  const uniqueDevelopers = new Set(jobs.map(job => job.workingDev)).size;
  const avgJobValue = totalRevenue / jobs.length;

  const recentJobs = jobs.slice(-5).reverse();

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue, 'USD'),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Company Earnings',
      value: formatCurrency(companyEarnings, 'USD'),
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Developer Payouts',
      value: formatCurrency(developerEarnings, 'USD'),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Active Developers',
      value: uniqueDevelopers.toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentJobs.map((job, index) => (
            <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium text-gray-900">{job.projectName}</p>
                <p className="text-sm text-gray-600">
                  {job.workingDev} • {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(job.paymentAmount, 'USD')}</p>
                <p className="text-sm text-gray-600">{job.frequency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;