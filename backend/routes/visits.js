const express = require('express');
const { body, validationResult } = require('express-validator');
const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new visit
// @route   POST /api/visits
// @access  Private (Reception)
router.post('/', [
  protect,
  authorize('reception', 'admin'),
  [
    body('patient')
      .isMongoId()
      .withMessage('Valid patient ID is required'),
    body('complaint')
      .notEmpty()
      .withMessage('Patient complaint is required')
      .isLength({ max: 1000 })
      .withMessage('Complaint cannot exceed 1000 characters'),
    body('visitDate')
      .optional()
      .isISO8601()
      .withMessage('Valid visit date is required')
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

    const { patient, complaint, visitDate } = req.body;

    // Check if patient exists
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const visitData = {
      patient,
      complaint,
      visitDate: visitDate || new Date(),
      status: 'registered'
    };

    const visit = await Visit.create(visitData);

    // Populate the patient data in response
    await visit.populate('patient', 'firstName lastName gender age contact');

    // Emit WebSocket event to notify checker doctors about new visit
    const io = req.app.get('io');
    if (io) {
      io.to('checkerDoctor').emit('new-visit', {
        visit: {
          _id: visit._id,
          patient: visit.patient,
          complaint: visit.complaint,
          visitDate: visit.visitDate,
          status: visit.status,
          createdAt: visit.createdAt
        }
      });
      console.log('New visit notification sent to checker doctors');
    }

    res.status(201).json({
      success: true,
      message: 'Visit created successfully',
      data: {
        visit
      }
    });
  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during visit creation'
    });
  }
});

// @desc    Get all visits
// @route   GET /api/visits
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
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.paid !== undefined) {
      filter.paid = req.query.paid === 'true';
    }

    // Role-based filtering
    if (req.user.role === 'checkerDoctor') {
      filter.checkerDoctor = req.user._id;
    } else if (req.user.role === 'mainDoctor') {
      filter.mainDoctor = req.user._id;
    }

    // Date filtering
    if (req.query.startDate) {
      filter.visitDate = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      filter.visitDate = { 
        ...filter.visitDate, 
        $lte: new Date(req.query.endDate) 
      };
    }

    const visits = await Visit.find(filter)
      .populate('patient', 'firstName lastName gender age contact')
      .populate('checkerDoctor', 'fullName role')
      .populate('mainDoctor', 'fullName role')
      .populate('labTests', 'testName isCompleted')
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
    console.error('Get visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visits'
    });
  }
});

// @desc    Get single visit
// @route   GET /api/visits/:id
// @access  Private
router.get('/:id', [
  protect
], async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('patient', 'firstName lastName gender age contact address')
      .populate('checkerDoctor', 'fullName role')
      .populate('mainDoctor', 'fullName role')
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

    res.status(200).json({
      success: true,
      data: {
        visit
      }
    });
  } catch (error) {
    console.error('Get visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visit'
    });
  }
});

// @desc    Update visit status
// @route   PUT /api/visits/:id/status
// @access  Private
router.put('/:id/status', [
  protect,
  [
    body('status')
      .isIn(['registered', 'checked', 'lab_pending', 'lab_done', 'diagnosed', 'done'])
      .withMessage('Invalid status')
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

    const { status, notes } = req.body;

    // Check if visit exists
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Role-based status updates
    const allowedStatusUpdates = {
      reception: ['registered', 'lab_pending'],
      checkerDoctor: ['checked', 'lab_pending'],
      labTech: ['lab_done'],
      mainDoctor: ['diagnosed'],
      pharmacy: ['done']
    };

    if (!allowedStatusUpdates[req.user.role]?.includes(status)) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized to update status to ${status}`
      });
    }

    const updateFields = { status };
    if (notes) updateFields.notes = notes;

    const updatedVisit = await Visit.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Visit status updated successfully',
      data: {
        visit: updatedVisit
      }
    });
  } catch (error) {
    console.error('Update visit status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating visit status'
    });
  }
});

// @desc    Get pending visits for checker doctor
// @route   GET /api/visits/pending
// @access  Private (Checker Doctor)
router.get('/pending', [
  protect,
  authorize('checkerDoctor')
], async (req, res) => {
  try {
    const visits = await Visit.find({
      status: 'registered',
      paid: true
    })
      .populate('patient', 'firstName lastName gender age contact')
      .sort({ visitDate: 1 });

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

// @desc    Get visits with lab results for main doctor
// @route   GET /api/visits/lab-done
// @access  Private (Main Doctor)
router.get('/lab-done', [
  protect,
  authorize('mainDoctor')
], async (req, res) => {
  try {
    const visits = await Visit.find({
      status: 'lab_done'
    })
      .populate('patient', 'firstName lastName gender age contact')
      .populate('labTests', 'testName result fileUrl isCompleted')
      .sort({ visitDate: 1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: {
        visits
      }
    });
  } catch (error) {
    console.error('Get lab done visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visits with lab results'
    });
  }
});

// @desc    Get visit statistics
// @route   GET /api/visits/stats/overview
// @access  Private (Admin, Reception)
router.get('/stats/overview', [
  protect,
  authorize('admin', 'reception')
], async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();
    
    const statusStats = await Visit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const dailyVisits = await Visit.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$visitDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const paidVsUnpaid = await Visit.aggregate([
      {
        $group: {
          _id: '$paid',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVisits,
        statusStats,
        dailyVisits,
        paidVsUnpaid
      }
    });
  } catch (error) {
    console.error('Visit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visit statistics'
    });
  }
});

module.exports = router;
