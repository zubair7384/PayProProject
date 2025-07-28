import express from 'express';
import Job from '../models/Job.js';
import { authenticate } from '../middleware/auth.js';
import { validateJob, handleValidationErrors } from '../middleware/validation.js';
import { calculateDistribution } from '../utils/calculations.js';

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs for authenticated user
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, frequency } = req.query;
    
    const query = { userId: req.user._id };
    
    // Add search filter
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { workingDev: { $regex: search, $options: 'i' } },
        { jobHunter: { $regex: search, $options: 'i' } },
        { communicatingDev: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add frequency filter
    if (frequency && frequency !== 'All') {
      query.frequency = frequency;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    // Map _id to id for frontend compatibility
    const jobsWithId = jobs.map(job => ({
      ...job.toObject(),
      id: job._id.toString()
    }));

    res.json({
      success: true,
      data: {
        jobs: jobsWithId,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
});

// @route   GET /api/jobs/stats
// @desc    Get job statistics for authenticated user
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await Job.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          totalRevenue: { $sum: '$paymentAmount' },
          totalCompanyEarnings: { $sum: '$distribution.company' },
          totalDeveloperEarnings: { $sum: '$distribution.workingDev' },
          uniqueDevelopers: { $addToSet: '$workingDev' }
        }
      },
      {
        $project: {
          _id: 0,
          totalJobs: 1,
          totalRevenue: 1,
          totalCompanyEarnings: 1,
          totalDeveloperEarnings: 1,
          uniqueDevelopers: { $size: '$uniqueDevelopers' },
          avgJobValue: { $divide: ['$totalRevenue', '$totalJobs'] }
        }
      }
    ]);

    const result = stats[0] || {
      totalJobs: 0,
      totalRevenue: 0,
      totalCompanyEarnings: 0,
      totalDeveloperEarnings: 0,
      uniqueDevelopers: 0,
      avgJobValue: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job'
    });
  }
});

// @route   POST /api/jobs
// @desc    Create new job
// @access  Private
router.post('/', authenticate, validateJob, handleValidationErrors, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      userId: req.user._id
    };

    // Calculate distribution
    const distribution = calculateDistribution(jobData);
    jobData.distribution = distribution;

    const job = new Job(jobData);
    await job.save();

    // Map _id to id for frontend compatibility
    const jobWithId = {
      ...job.toObject(),
      id: job._id.toString()
    };

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job: jobWithId }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job'
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private
router.put('/:id', authenticate, validateJob, handleValidationErrors, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Recalculate distribution with new data
    const distribution = calculateDistribution(req.body);
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body, distribution },
      { new: true, runValidators: true }
    );

    // Map _id to id for frontend compatibility
    const jobWithId = {
      ...updatedJob.toObject(),
      id: updatedJob._id.toString()
    };

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: jobWithId }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating job'
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job'
    });
  }
});

// @route   GET /api/jobs/names/suggestions
// @desc    Get name suggestions for autocomplete
// @access  Private
router.get('/names/suggestions', authenticate, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id })
      .select('workingDev jobHunter communicatingDev')
      .lean();

    const names = new Set();
    jobs.forEach(job => {
      if (job.workingDev) names.add(job.workingDev);
      if (job.jobHunter) names.add(job.jobHunter);
      if (job.communicatingDev) names.add(job.communicatingDev);
    });

    res.json({
      success: true,
      data: Array.from(names).filter(name => name && name.trim() !== '')
    });
  } catch (error) {
    console.error('Get name suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching name suggestions'
    });
  }
});

export default router;