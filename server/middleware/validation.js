import { body, validationResult } from 'express-validator';

export const validateSignin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const validateJob = [
  body('projectName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name is required and must be less than 100 characters'),
  body('paymentAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be a positive number'),
  body('conversionRate')
    .isFloat({ min: 0.01 })
    .withMessage('Conversion rate must be a positive number'),
  body('frequency')
    .isIn(['Daily', 'Weekly', 'Monthly'])
    .withMessage('Frequency must be Daily, Weekly, or Monthly'),
  body('workingDev')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Working developer name is required'),
  body('communicatingDev')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Communicating developer name is required'),
  body('jobHunter')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Job hunter name is required'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};