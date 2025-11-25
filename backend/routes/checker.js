const express = require('express');
const { body, validationResult } = require('express-validator');
const Visit = require('../models/Visit');
const LabTest = require('../models/LabTest');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all paid patients for checking
// @route   GET /api/checker/visits/pending
// @access  Private (Checker Doctor)
router.get('/visits/pending', [
  protect,
  authorize('checkerDoctor')
], async (req, res) => {
  try {
    console.log('Fetching pending visits for checker doctor...');
    
    const visits = await Visit.find({
      status: 'registered',
      paid: true
    })
      .populate('patient', 'firstName lastName gender age contact')
      .sort({ visitDate: 1 });

    console.log(`Found ${visits.length} pending visits for checker doctor`);
    
    if (visits.length > 0) {
      console.log('Pending visits:', visits.map(v => ({
        id: v._id,
        patient: v.patient?.firstName + ' ' + v.patient?.lastName,
        status: v.status,
        paid: v.paid
      })));
    }

    res.status(200).json({
      success: true,
      count: visits.length,
      data: {
        visits
      }
    });
  } catch (error) {
    console.error('Get pending visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending visits'
    });
  }
});

// @desc    Save symptoms and lab test list
// @route   PUT /api/checker/visits/:id/checker
// @access  Private (Checker Doctor)
router.put('/visits/:id/checker', [
  protect,
  authorize('checkerDoctor'),
  [
    body('symptoms')
      .notEmpty()
      .withMessage('Symptoms are required')
      .isLength({ max: 1000 })
      .withMessage('Symptoms cannot exceed 1000 characters'),
    body('labTests')
      .isArray()
      .withMessage('Lab tests must be an array'),
    body('labTests.*.testName')
      .notEmpty()
      .withMessage('Test name is required')
      .isLength({ max: 100 })
      .withMessage('Test name cannot exceed 100 characters'),
    body('labTests.*.testType')
      .isIn(['blood', 'urine', 'xray', 'ct', 'mri', 'ultrasound', 'other'])
      .withMessage('Invalid test type'),
    body('labTests.*.cost')
      .optional()
      .isNumeric()
      .withMessage('Cost must be a number')
      .isFloat({ min: 0 })
      .withMessage('Cost cannot be negative')
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

    const { symptoms, labTests } = req.body;

    // Check if visit exists
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Check if visit is in correct status
    if (visit.status !== 'registered') {
      return res.status(400).json({
        success: false,
        message: 'Visit is not in registered status'
      });
    }

    // Create lab tests if provided
    let createdLabTests = [];
    if (labTests && labTests.length > 0) {
      const labTestPromises = labTests.map(labTestData => 
        LabTest.create({
          visit: visit._id,
          testName: labTestData.testName,
          testType: labTestData.testType,
          cost: labTestData.cost || 0,
          notes: labTestData.notes
        })
      );
      
      createdLabTests = await Promise.all(labTestPromises);
    }

    // Calculate total lab cost
    const totalLabCost = createdLabTests.reduce((sum, test) => sum + test.cost, 0);

    // Update visit
    const updatedVisit = await Visit.findByIdAndUpdate(
      req.params.id,
      {
        symptoms,
        checkerDoctor: req.user._id,
        status: labTests && labTests.length > 0 ? 'lab_pending' : 'checked',
        labTests: createdLabTests.map(test => test._id),
        totalCost: visit.totalCost + totalLabCost
      },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName')
     .populate('labTests', 'testName testType cost');

    res.status(200).json({
      success: true,
      message: 'Visit checked successfully',
      data: {
        visit: updatedVisit,
        labTests: createdLabTests
      }
    });
  } catch (error) {
    console.error('Update visit checker error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating visit'
    });
  }
});

// @desc    Get visits assigned to checker doctor
// @route   GET /api/checker/visits
// @access  Private (Checker Doctor)
router.get('/visits', [
  protect,
  authorize('checkerDoctor')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      checkerDoctor: req.user._id
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const visits = await Visit.find(filter)
      .populate('patient', 'firstName lastName gender age contact')
      .populate('labTests', 'testName testType isCompleted')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Visit.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: visits.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        visits
      }
    });
  } catch (error) {
    console.error('Get checker visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visits'
    });
  }
});

// @desc    Get single visit for checker
// @route   GET /api/checker/visits/:id
// @access  Private (Checker Doctor)
router.get('/visits/:id', [
  protect,
  authorize('checkerDoctor')
], async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('patient', 'firstName lastName gender age contact address')
      .populate('labTests')
      .populate({
        path: 'labTests',
        populate: {
          path: 'performedBy',
          select: 'fullName role'
        }
      });
    
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Check if checker doctor is assigned to this visit
    if (visit.checkerDoctor && visit.checkerDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this visit'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        visit
      }
    });
  } catch (error) {
    console.error('Get checker visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visit'
    });
  }
});

// @desc    Update visit without lab tests (direct diagnosis)
// @route   PUT /api/checker/visits/:id/direct
// @access  Private (Checker Doctor)
router.put('/visits/:id/direct', [
  protect,
  authorize('checkerDoctor'),
  [
    body('symptoms')
      .notEmpty()
      .withMessage('Symptoms are required')
      .isLength({ max: 1000 })
      .withMessage('Symptoms cannot exceed 1000 characters'),
    body('diagnosis')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Diagnosis cannot exceed 1000 characters')
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

    const { symptoms, diagnosis } = req.body;

    // Check if visit exists
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Update visit
    const updatedVisit = await Visit.findByIdAndUpdate(
      req.params.id,
      {
        symptoms,
        diagnosis,
        checkerDoctor: req.user._id,
        status: diagnosis ? 'diagnosed' : 'checked'
      },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Visit updated successfully',
      data: {
        visit: updatedVisit
      }
    });
  } catch (error) {
    console.error('Update visit direct error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating visit'
    });
  }
});

// @desc    Get checker doctor statistics
// @route   GET /api/checker/stats
// @access  Private (Checker Doctor)
router.get('/stats', [
  protect,
  authorize('checkerDoctor')
], async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments({ checkerDoctor: req.user._id });
    
    const statusStats = await Visit.aggregate([
      {
        $match: { checkerDoctor: req.user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const todayVisits = await Visit.countDocuments({
      checkerDoctor: req.user._id,
      visitDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const weeklyVisits = await Visit.aggregate([
      {
        $match: {
          checkerDoctor: req.user._id,
          visitDate: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$visitDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVisits,
        statusStats,
        todayVisits,
        weeklyVisits
      }
    });
  } catch (error) {
    console.error('Checker stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching checker statistics'
    });
  }
});

module.exports = router;
