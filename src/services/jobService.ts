import api from './api';

export interface JobFormData {
  projectName: string;
  paymentAmount: number;
  conversionRate: number;
  frequency: 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  workingDev: string;
  communicatingDev?: string;
  jobHunter?: string;
  advancedPolicy?: {
    companyPercentage: number;
    developerPercentage: number;
    jobHunterPercentage: number;
    communicatorPercentage: number;
    interns: Array<{
      id: string;
      name: string;
      type: 'fixed' | 'percentage';
      amount: number;
      percentage: number;
    }>;
  };
}

export interface JobRecord {
  id: string;
  projectName: string;
  paymentAmount: number;
  conversionRate: number;
  frequency: 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  communicatingDev: string;
  jobHunter: string;
  workingDev: string;
  distribution: {
    company: number;
    workingDev: number;
    jobHunter: number;
    communicator: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface JobsResponse {
  success: boolean;
  data: {
    jobs: JobRecord[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export interface JobStatsResponse {
  success: boolean;
  data: {
    totalJobs: number;
    totalEarnings: number;
    averagePayment: number;
    frequencyBreakdown: Record<string, number>;
    monthlyEarnings: Array<{
      month: string;
      earnings: number;
    }>;
  };
}

export interface NameSuggestionsResponse {
  success: boolean;
  data: {
    projectNames: string[];
    developerNames: string[];
  };
}

class JobService {
  // Get all jobs with optional filters
  async getJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    frequency?: string;
  }): Promise<JobsResponse> {
    const response = await api.get('/jobs', { params });
    return response.data;
  }

  // Get job statistics
  async getJobStats(): Promise<JobStatsResponse> {
    const response = await api.get('/jobs/stats');
    return response.data;
  }

  // Get single job by ID
  async getJob(id: string): Promise<{ success: boolean; data: JobRecord }> {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  }

  // Create new job
  async createJob(jobData: JobFormData): Promise<{ success: boolean; data: JobRecord }> {
    const response = await api.post('/jobs', jobData);
    return response.data;
  }

  // Update existing job
  async updateJob(id: string, jobData: Partial<JobFormData>): Promise<{ success: boolean; data: JobRecord }> {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  }

  // Delete job
  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  }

  // Get name suggestions for autocomplete
  async getNameSuggestions(): Promise<NameSuggestionsResponse> {
    try {
      const response = await api.get('/jobs/names/suggestions');
      return response.data;
    } catch (error) {
      console.error('Get name suggestions error:', error);
      throw error;
    }
  }

  // Alias for getJob for consistency
  async getJobById(id: string): Promise<{ success: boolean; data: JobRecord }> {
    return this.getJob(id);
  }
}

export default new JobService();
