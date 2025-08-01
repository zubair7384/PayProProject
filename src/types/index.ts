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

export interface FormData {
  projectName: string;
  paymentAmount: string;
  conversionRate: string;
  frequency: 'One-time' | 'Weekly' | 'Bi-weekly' | 'Monthly';
  communicatingDev: string;
  jobHunter: string;
  workingDev: string;
}