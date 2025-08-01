export interface AdvancedPolicyFormData {
  projectName: string;
  paymentAmount: string;
  conversionRate: string;
  frequency: 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  workingDev: string;
  jobHunter: string;
  communicator: string;
  companyPercentage: number;
  developerPercentage: number;
  jobHunterPercentage: number;
  communicatorPercentage: number;
  interns: Array<{
    id: string;
    name: string;
    type: 'fixed' | 'percentage';
    amount: string;
    percentage: number;
  }>;
}

export interface AdvancedPolicyRecord {
  id: string;
  projectName: string;
  paymentAmount: number;
  conversionRate: number;
  frequency: 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  workingDev: string;
  jobHunter: string;
  communicator: string;
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
  distribution: {
    company: number;
    developer: number;
    jobHunter: number;
    communicator: number;
    intern: number;
    total: number;
  };
  createdAt: string;
  updatedAt?: string;
}
