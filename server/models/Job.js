import mongoose from 'mongoose';

const distributionSchema = new mongoose.Schema({
  company: {
    type: Number,
    required: true,
    min: 0
  },
  workingDev: {
    type: Number,
    required: true,
    min: 0
  },
  jobHunter: {
    type: Number,
    default: 0,
    min: 0
  },
  communicator: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const jobSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed from ObjectId to String for admin-only setup
    required: true
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Payment amount must be greater than 0']
  },
  conversionRate: {
    type: Number,
    required: [true, 'Conversion rate is required'],
    min: [0.01, 'Conversion rate must be greater than 0']
  },
  frequency: {
    type: String,
    required: true,
    enum: ['Daily', 'Weekly', 'Monthly']
  },
  communicatingDev: {
    type: String,
    required: true,
    trim: true
  },
  jobHunter: {
    type: String,
    required: true,
    trim: true
  },
  workingDev: {
    type: String,
    required: true,
    trim: true
  },
  distribution: {
    type: distributionSchema,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ userId: 1, projectName: 1 });

export default mongoose.model('Job', jobSchema);