import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate as auth } from '../middleware/auth.js';

const router = express.Router();

// In-memory storage for advanced policies (replace with database in production)
let advancedPolicies = [];

// Calculate distribution based on advanced policy rules
const calculateAdvancedDistribution = (data) => {
  const totalAmount = parseFloat(data.paymentAmount);
  const companyAmount = (totalAmount * data.companyPercentage) / 100;
  const developerBaseAmount = (totalAmount * data.developerPercentage) / 100;
  
  let jobHunterAmount = 0;
  let communicatorAmount = 0;
  
  // Job hunter gets percentage only if different from working developer
  if (data.jobHunter && data.jobHunter !== data.workingDev) {
    jobHunterAmount = (developerBaseAmount * data.jobHunterPercentage) / 100;
  }
  
  // Communicator gets percentage only if different from working developer
  if (data.communicator && data.communicator !== data.workingDev) {
    communicatorAmount = (developerBaseAmount * data.communicatorPercentage) / 100;
  }
  
  const finalDeveloperAmount = developerBaseAmount - jobHunterAmount - communicatorAmount;
  
  let internAmount = 0;
  let finalDeveloperAfterIntern = finalDeveloperAmount;
  
  // Calculate intern payment based on type
  if (data.internType === 'fixed' && data.internAmount) {
    internAmount = parseFloat(data.internAmount);
    finalDeveloperAfterIntern = finalDeveloperAmount - internAmount;
  } else if (data.internType === 'percentage' && data.internPercentage) {
    internAmount = (finalDeveloperAmount * data.internPercentage) / 100;
    finalDeveloperAfterIntern = finalDeveloperAmount - internAmount;
  }
  
  return {
    company: companyAmount,
    developer: finalDeveloperAfterIntern,
    jobHunter: jobHunterAmount,
    communicator: communicatorAmount,
    intern: internAmount,
    total: totalAmount
  };
};

// GET /api/advanced-policies - Get all advanced policies
router.get('/', auth, (req, res) => {
  try {
    res.json(advancedPolicies);
  } catch (error) {
    console.error('Error fetching advanced policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/advanced-policies - Create new advanced policy
router.post('/', auth, (req, res) => {
  try {
    const {
      projectName,
      paymentAmount,
      conversionRate,
      frequency,
      workingDev,
      jobHunter,
      communicator,
      companyPercentage,
      developerPercentage,
      jobHunterPercentage,
      communicatorPercentage,
      internType,
      internName,
      internAmount,
      internPercentage
    } = req.body;

    // Validation
    if (!projectName || !paymentAmount || !workingDev) {
      return res.status(400).json({ 
        error: 'Project name, payment amount, and working developer are required' 
      });
    }

    if (parseFloat(paymentAmount) <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    // Calculate distribution
    const distribution = calculateAdvancedDistribution(req.body);

    // Create new advanced policy record
    const newPolicy = {
      id: uuidv4(),
      projectName,
      paymentAmount: parseFloat(paymentAmount),
      conversionRate: parseFloat(conversionRate) || 278,
      frequency,
      workingDev,
      jobHunter: jobHunter || '',
      communicator: communicator || '',
      companyPercentage: companyPercentage || 30,
      developerPercentage: developerPercentage || 70,
      jobHunterPercentage: jobHunterPercentage || 5,
      communicatorPercentage: communicatorPercentage || 10,
      internType: internType || 'none',
      internName: internName || '',
      internAmount: parseFloat(internAmount) || 0,
      internPercentage: internPercentage || 10,
      distribution,
      createdAt: new Date().toISOString(),
      userId: req.user.id
    };

    advancedPolicies.push(newPolicy);

    res.status(201).json({
      message: 'Advanced policy created successfully',
      policy: newPolicy
    });
  } catch (error) {
    console.error('Error creating advanced policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/advanced-policies/:id - Get specific advanced policy
router.get('/:id', auth, (req, res) => {
  try {
    const policy = advancedPolicies.find(p => p.id === req.params.id);
    
    if (!policy) {
      return res.status(404).json({ error: 'Advanced policy not found' });
    }

    res.json(policy);
  } catch (error) {
    console.error('Error fetching advanced policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/advanced-policies/:id - Update advanced policy
router.put('/:id', auth, (req, res) => {
  try {
    const policyIndex = advancedPolicies.findIndex(p => p.id === req.params.id);
    
    if (policyIndex === -1) {
      return res.status(404).json({ error: 'Advanced policy not found' });
    }

    const existingPolicy = advancedPolicies[policyIndex];
    
    // Calculate new distribution
    const distribution = calculateAdvancedDistribution(req.body);

    // Update policy
    const updatedPolicy = {
      ...existingPolicy,
      ...req.body,
      paymentAmount: parseFloat(req.body.paymentAmount),
      conversionRate: parseFloat(req.body.conversionRate),
      internAmount: parseFloat(req.body.internAmount) || 0,
      distribution,
      updatedAt: new Date().toISOString()
    };

    advancedPolicies[policyIndex] = updatedPolicy;

    res.json({
      message: 'Advanced policy updated successfully',
      policy: updatedPolicy
    });
  } catch (error) {
    console.error('Error updating advanced policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/advanced-policies/:id - Delete advanced policy
router.delete('/:id', auth, (req, res) => {
  try {
    const policyIndex = advancedPolicies.findIndex(p => p.id === req.params.id);
    
    if (policyIndex === -1) {
      return res.status(404).json({ error: 'Advanced policy not found' });
    }

    advancedPolicies.splice(policyIndex, 1);

    res.json({ message: 'Advanced policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting advanced policy:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
