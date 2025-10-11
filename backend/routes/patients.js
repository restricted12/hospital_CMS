const express = require('express');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Register new patient
// @route   POST /api/patients
// @access  Private (Reception)
router.post('/', [
  protect,
  authorize('reception', 'admin'),
  [
    body('firstName')
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),
    body('gender')
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be one of: male, female, other'),
    body('age')
      .isInt({ min: 0, max: 150 })
      .withMessage('Age must be between 0 and 150'),
    body('contact.phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Please enter a valid phone number'),
    body('contact.email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ]
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const patientData = {
      ...req.body,
      registeredBy: req.user._id
    };

    const patient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during patient registration'
    });
  }
});

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
router.get('/', [
  protect
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.gender) {
      filter.gender = req.query.gender;
    }

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { 'contact.phone': { $regex: req.query.search, $options: 'i' } },
        { 'contact.email': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(filter)
      .populate('registeredBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Patient.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        patients
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patients'
    });
  }
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
router.get('/:id', [
  protect
], async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('registeredBy', 'fullName email');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        patient
      }
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient'
    });
  }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Reception, Admin)
router.put('/:id', [
  protect,
  authorize('reception', 'admin'),
  [
    body('firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be one of: male, female, other'),
    body('age')
      .optional()
      .isInt({ min: 0, max: 150 })
      .withMessage('Age must be between 0 and 150'),
    body('contact.phone')
      .optional()
      .matches(/^\+?[\d\s\-\(\)]+$/)
      .withMessage('Please enter a valid phone number'),
    body('contact.email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ]
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('registeredBy', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: {
        patient: updatedPatient
      }
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating patient'
    });
  }
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
router.delete('/:id', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    // Check if patient exists
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting patient'
    });
  }
});

// @desc    Get patient statistics
// @route   GET /api/patients/stats/overview
// @access  Private (Admin, Reception)
router.get('/stats/overview', [
  protect,
  authorize('admin', 'reception')
], async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    
    const genderStats = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const ageGroups = await Patient.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 18] }, then: '0-17' },
                { case: { $lt: ['$age', 35] }, then: '18-34' },
                { case: { $lt: ['$age', 50] }, then: '35-49' },
                { case: { $lt: ['$age', 65] }, then: '50-64' },
                { case: { $gte: ['$age', 65] }, then: '65+' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const recentPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        genderStats,
        ageGroups,
        recentPatients
      }
    });
  } catch (error) {
    console.error('Patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient statistics'
    });
  }
});

module.exports = router;
