const express = require('express');
const { body, validationResult } = require('express-validator');
const LabTest = require('../models/LabTest');
const Visit = require('../models/Visit');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @desc    Get lab tests assigned to lab tech
// @route   GET /api/labs
// @access  Private (Lab Tech)
router.get('/', [
  protect,
  authorize('labTech')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.isCompleted !== undefined) {
      filter.isCompleted = req.query.isCompleted === 'true';
    }
    if (req.query.testType) {
      filter.testType = req.query.testType;
    }

    const labTests = await LabTest.find(filter)
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact'
        }
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await LabTest.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: labTests.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        labTests
      }
    });
  } catch (error) {
    console.error('Get lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab tests'
    });
  }
});

// @desc    Get single lab test
// @route   GET /api/labs/:id
// @access  Private (Lab Tech)
router.get('/:id', [
  protect,
  authorize('labTech')
], async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id)
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact'
        }
      })
      .populate('performedBy', 'fullName role');
    
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        labTest
      }
    });
  } catch (error) {
    console.error('Get lab test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab test'
    });
  }
});

// @desc    Upload test result
// @route   PUT /api/labs/:id/result
// @access  Private (Lab Tech)
router.put('/:id/result', [
  protect,
  authorize('labTech'),
  upload.single('resultFile'),
  [
    body('result')
      .notEmpty()
      .withMessage('Test result is required')
      .isLength({ max: 2000 })
      .withMessage('Result cannot exceed 2000 characters'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
  ]
], handleUploadError, async (req, res) => {
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

    const { result, notes } = req.body;
    const fileUrl = req.file ? req.file.path : null;

    // Check if lab test exists
    const labTest = await LabTest.findById(req.params.id);
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    // Check if already completed
    if (labTest.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Lab test is already completed'
      });
    }

    // Update lab test
    const updatedLabTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      {
        result,
        fileUrl,
        notes,
        performedBy: req.user._id,
        isCompleted: true,
        completedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('visit', 'visitNumber')
     .populate({
       path: 'visit',
       populate: {
         path: 'patient',
         select: 'firstName lastName'
       }
     })
     .populate('performedBy', 'fullName role');

    // Check if all lab tests for this visit are completed
    const allLabTests = await LabTest.find({ visit: labTest.visit });
    const allCompleted = allLabTests.every(test => test.isCompleted);

    if (allCompleted) {
      // Update visit status to lab_done
      await Visit.findByIdAndUpdate(
        labTest.visit,
        { status: 'lab_done' },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Test result uploaded successfully',
      data: {
        labTest: updatedLabTest
      }
    });
  } catch (error) {
    console.error('Upload test result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading test result'
    });
  }
});

// @desc    Get pending lab tests
// @route   GET /api/labs/pending
// @access  Private (Lab Tech)
router.get('/pending', [
  protect,
  authorize('labTech')
], async (req, res) => {
  try {
    const labTests = await LabTest.find({
      isCompleted: false
    })
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact'
        }
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: labTests.length,
      data: {
        labTests
      }
    });
  } catch (error) {
    console.error('Get pending lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending lab tests'
    });
  }
});

// @desc    Get completed lab tests
// @route   GET /api/labs/completed
// @access  Private (Lab Tech)
router.get('/completed', [
  protect,
  authorize('labTech')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const labTests = await LabTest.find({
      isCompleted: true
    })
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact'
        }
      })
      .populate('performedBy', 'fullName role')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LabTest.countDocuments({ isCompleted: true });

    res.status(200).json({
      success: true,
      count: labTests.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        labTests
      }
    });
  } catch (error) {
    console.error('Get completed lab tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching completed lab tests'
    });
  }
});

// @desc    Update lab test status
// @route   PUT /api/labs/:id/status
// @access  Private (Lab Tech)
router.put('/:id/status', [
  protect,
  authorize('labTech'),
  [
    body('isCompleted')
      .isBoolean()
      .withMessage('isCompleted must be a boolean')
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

    const { isCompleted } = req.body;

    // Check if lab test exists
    const labTest = await LabTest.findById(req.params.id);
    if (!labTest) {
      return res.status(404).json({
        success: false,
        message: 'Lab test not found'
      });
    }

    const updateFields = { isCompleted };
    if (isCompleted && !labTest.isCompleted) {
      updateFields.performedBy = req.user._id;
      updateFields.completedAt = new Date();
    }

    const updatedLabTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('visit', 'visitNumber')
     .populate('performedBy', 'fullName role');

    res.status(200).json({
      success: true,
      message: 'Lab test status updated successfully',
      data: {
        labTest: updatedLabTest
      }
    });
  } catch (error) {
    console.error('Update lab test status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating lab test status'
    });
  }
});

// @desc    Get lab tech statistics
// @route   GET /api/labs/stats
// @access  Private (Lab Tech)
router.get('/stats', [
  protect,
  authorize('labTech')
], async (req, res) => {
  try {
    const totalTests = await LabTest.countDocuments();
    const completedTests = await LabTest.countDocuments({ isCompleted: true });
    const pendingTests = await LabTest.countDocuments({ isCompleted: false });
    
    const testTypeStats = await LabTest.aggregate([
      {
        $group: {
          _id: '$testType',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          }
        }
      }
    ]);

    const todayTests = await LabTest.countDocuments({
      performedBy: req.user._id,
      completedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const weeklyTests = await LabTest.aggregate([
      {
        $match: {
          performedBy: req.user._id,
          completedAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTests,
        completedTests,
        pendingTests,
        testTypeStats,
        todayTests,
        weeklyTests
      }
    });
  } catch (error) {
    console.error('Lab stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lab statistics'
    });
  }
});

module.exports = router;
