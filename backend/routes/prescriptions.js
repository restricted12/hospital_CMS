const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Visit = require('../models/Visit');
const Medicine = require('../models/Medicine');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all visits with lab results for main doctor
// @route   GET /api/visits/lab-done
// @access  Private (Main Doctor)
router.get('/visits/lab-done', [
  protect,
  authorize('mainDoctor')
], async (req, res) => {
  try {
    const visits = await Visit.find({
      status: 'lab_done'
    })
      .populate('patient', 'firstName lastName gender age contact')
      .populate('checkerDoctor', 'fullName role')
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

// @desc    Add final prescription
// @route   POST /api/prescriptions
// @access  Private (Main Doctor)
router.post('/', [
  protect,
  authorize('mainDoctor'),
  [
    body('visit')
      .isMongoId()
      .withMessage('Valid visit ID is required'),
    body('medicines')
      .isArray({ min: 1 })
      .withMessage('At least one medicine is required'),
    body('medicines.*.name')
      .notEmpty()
      .withMessage('Medicine name is required')
      .isLength({ max: 100 })
      .withMessage('Medicine name cannot exceed 100 characters'),
    body('medicines.*.dosage')
      .notEmpty()
      .withMessage('Dosage is required')
      .isLength({ max: 50 })
      .withMessage('Dosage cannot exceed 50 characters'),
    body('medicines.*.duration')
      .notEmpty()
      .withMessage('Duration is required')
      .isLength({ max: 50 })
      .withMessage('Duration cannot exceed 50 characters'),
    body('medicines.*.instruction')
      .notEmpty()
      .withMessage('Instruction is required')
      .isLength({ max: 200 })
      .withMessage('Instruction cannot exceed 200 characters'),
    body('medicines.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('diagnosis')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Diagnosis cannot exceed 1000 characters'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
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

    const { visit, medicines, diagnosis, notes } = req.body;

    // Check if visit exists
    const visitExists = await Visit.findById(visit);
    if (!visitExists) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Check if visit is in correct status
    if (visitExists.status !== 'lab_done') {
      return res.status(400).json({
        success: false,
        message: 'Visit is not ready for prescription'
      });
    }

    // Calculate total cost of medicines
    let totalCost = 0;
    const medicinePromises = medicines.map(async (medicine) => {
      const medicineDoc = await Medicine.findOne({ name: medicine.name });
      if (medicineDoc) {
        return medicineDoc.price * medicine.quantity;
      }
      return 0;
    });
    
    const costs = await Promise.all(medicinePromises);
    totalCost = costs.reduce((sum, cost) => sum + cost, 0);

    // Create prescription
    const prescription = await Prescription.create({
      visit,
      mainDoctor: req.user._id,
      medicines,
      totalCost,
      notes
    });

    // Update visit with diagnosis and prescription
    const updatedVisit = await Visit.findByIdAndUpdate(
      visit,
      {
        diagnosis,
        mainDoctor: req.user._id,
        status: 'diagnosed',
        totalCost: visitExists.totalCost + totalCost
      },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName');

    // Populate prescription data
    await prescription.populate('visit', 'visitNumber')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName'
        }
      })
      .populate('mainDoctor', 'fullName role');

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        prescription,
        visit: updatedVisit
      }
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during prescription creation'
    });
  }
});

// @desc    Get prescription for visit
// @route   GET /api/prescriptions/:visitId
// @access  Private
router.get('/:visitId', [
  protect
], async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ visit: req.params.visitId })
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact'
        }
      })
      .populate('mainDoctor', 'fullName role')
      .populate('dispensedBy', 'fullName role');
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        prescription
      }
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prescription'
    });
  }
});

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
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
    if (req.query.pharmacyStatus) {
      filter.pharmacyStatus = req.query.pharmacyStatus;
    }

    // Role-based filtering
    if (req.user.role === 'mainDoctor') {
      filter.mainDoctor = req.user._id;
    }

    const prescriptions = await Prescription.find(filter)
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact'
        }
      })
      .populate('mainDoctor', 'fullName role')
      .populate('dispensedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prescription.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        prescriptions
      }
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prescriptions'
    });
  }
});

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Main Doctor)
router.put('/:id', [
  protect,
  authorize('mainDoctor'),
  [
    body('medicines')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one medicine is required'),
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters')
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

    // Check if prescription exists
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if main doctor is authorized
    if (prescription.mainDoctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this prescription'
      });
    }

    // Check if already dispensed
    if (prescription.pharmacyStatus === 'dispensed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update dispensed prescription'
      });
    }

    const updateFields = {};
    if (req.body.medicines) {
      updateFields.medicines = req.body.medicines;
      
      // Recalculate total cost
      let totalCost = 0;
      const medicinePromises = req.body.medicines.map(async (medicine) => {
        const medicineDoc = await Medicine.findOne({ name: medicine.name });
        if (medicineDoc) {
          return medicineDoc.price * medicine.quantity;
        }
        return 0;
      });
      
      const costs = await Promise.all(medicinePromises);
      totalCost = costs.reduce((sum, cost) => sum + cost, 0);
      updateFields.totalCost = totalCost;
    }
    if (req.body.notes !== undefined) {
      updateFields.notes = req.body.notes;
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('visit', 'visitNumber')
     .populate({
       path: 'visit',
       populate: {
         path: 'patient',
         select: 'firstName lastName'
       }
     })
     .populate('mainDoctor', 'fullName role');

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: {
        prescription: updatedPrescription
      }
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating prescription'
    });
  }
});

// @desc    Get main doctor statistics
// @route   GET /api/prescriptions/stats
// @access  Private (Main Doctor)
router.get('/stats', [
  protect,
  authorize('mainDoctor')
], async (req, res) => {
  try {
    const totalPrescriptions = await Prescription.countDocuments({ mainDoctor: req.user._id });
    
    const statusStats = await Prescription.aggregate([
      {
        $match: { mainDoctor: req.user._id }
      },
      {
        $group: {
          _id: '$pharmacyStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const todayPrescriptions = await Prescription.countDocuments({
      mainDoctor: req.user._id,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const weeklyPrescriptions = await Prescription.aggregate([
      {
        $match: {
          mainDoctor: req.user._id,
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalRevenue = await Prescription.aggregate([
      {
        $match: { mainDoctor: req.user._id }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCost' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPrescriptions,
        statusStats,
        todayPrescriptions,
        weeklyPrescriptions,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Prescription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prescription statistics'
    });
  }
});

module.exports = router;
