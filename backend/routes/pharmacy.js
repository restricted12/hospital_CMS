const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const Visit = require('../models/Visit');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    List pending prescriptions
// @route   GET /api/prescriptions/pending
// @access  Private (Pharmacy)
router.get('/prescriptions/pending', [
  protect,
  authorize('pharmacy')
], async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      pharmacyStatus: 'pending'
    })
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact'
        }
      })
      .populate('mainDoctor', 'fullName role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: {
        prescriptions
      }
    });
  } catch (error) {
    console.error('Get pending prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending prescriptions'
    });
  }
});

// @desc    Get all prescriptions for pharmacy
// @route   GET /api/prescriptions
// @access  Private (Pharmacy)
router.get('/prescriptions', [
  protect,
  authorize('pharmacy')
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

// @desc    Get single prescription for pharmacy
// @route   GET /api/prescriptions/:id
// @access  Private (Pharmacy)
router.get('/prescriptions/:id', [
  protect,
  authorize('pharmacy')
], async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact address'
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

// @desc    Mark prescription as dispensed
// @route   PUT /api/prescriptions/:id/dispense
// @access  Private (Pharmacy)
router.put('/prescriptions/:id/dispense', [
  protect,
  authorize('pharmacy'),
  [
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

    const { notes } = req.body;

    // Check if prescription exists
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if already dispensed
    if (prescription.pharmacyStatus === 'dispensed') {
      return res.status(400).json({
        success: false,
        message: 'Prescription is already dispensed'
      });
    }

    // Update medicine stock
    for (const medicine of prescription.medicines) {
      const medicineDoc = await Medicine.findOne({ name: medicine.name });
      if (medicineDoc) {
        if (medicineDoc.stock >= medicine.quantity) {
          medicineDoc.stock -= medicine.quantity;
          await medicineDoc.save();
        } else {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${medicine.name}. Available: ${medicineDoc.stock}, Required: ${medicine.quantity}`
          });
        }
      }
    }

    // Update prescription
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        pharmacyStatus: 'dispensed',
        dispensedBy: req.user._id,
        dispensedAt: new Date(),
        notes: notes || prescription.notes
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
     .populate('mainDoctor', 'fullName role')
     .populate('dispensedBy', 'fullName role');

    // Update visit status to done
    await Visit.findByIdAndUpdate(
      prescription.visit,
      { status: 'done' },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Prescription dispensed successfully',
      data: {
        prescription: updatedPrescription
      }
    });
  } catch (error) {
    console.error('Dispense prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while dispensing prescription'
    });
  }
});

// @desc    Partially dispense prescription
// @route   PUT /api/prescriptions/:id/partial-dispense
// @access  Private (Pharmacy)
router.put('/prescriptions/:id/partial-dispense', [
  protect,
  authorize('pharmacy'),
  [
    body('dispensedMedicines')
      .isArray({ min: 1 })
      .withMessage('At least one medicine must be dispensed'),
    body('dispensedMedicines.*.name')
      .notEmpty()
      .withMessage('Medicine name is required'),
    body('dispensedMedicines.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
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

    const { dispensedMedicines, notes } = req.body;

    // Check if prescription exists
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if already fully dispensed
    if (prescription.pharmacyStatus === 'dispensed') {
      return res.status(400).json({
        success: false,
        message: 'Prescription is already fully dispensed'
      });
    }

    // Update medicine stock and track dispensed quantities
    const updatedMedicines = prescription.medicines.map(medicine => {
      const dispensed = dispensedMedicines.find(dm => dm.name === medicine.name);
      if (dispensed) {
        const newQuantity = medicine.quantity - dispensed.quantity;
        return {
          ...medicine.toObject(),
          quantity: newQuantity,
          dispensedQuantity: (medicine.dispensedQuantity || 0) + dispensed.quantity
        };
      }
      return medicine;
    });

    // Update stock in database
    for (const dispensedMedicine of dispensedMedicines) {
      const medicineDoc = await Medicine.findOne({ name: dispensedMedicine.name });
      if (medicineDoc) {
        if (medicineDoc.stock >= dispensedMedicine.quantity) {
          medicineDoc.stock -= dispensedMedicine.quantity;
          await medicineDoc.save();
        } else {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${dispensedMedicine.name}. Available: ${medicineDoc.stock}, Required: ${dispensedMedicine.quantity}`
          });
        }
      }
    }

    // Check if all medicines are fully dispensed
    const allDispensed = updatedMedicines.every(medicine => medicine.quantity === 0);

    // Update prescription
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        medicines: updatedMedicines,
        pharmacyStatus: allDispensed ? 'dispensed' : 'partially_dispensed',
        dispensedBy: req.user._id,
        dispensedAt: allDispensed ? new Date() : prescription.dispensedAt,
        notes: notes || prescription.notes
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
     .populate('mainDoctor', 'fullName role')
     .populate('dispensedBy', 'fullName role');

    // Update visit status if fully dispensed
    if (allDispensed) {
      await Visit.findByIdAndUpdate(
        prescription.visit,
        { status: 'done' },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: allDispensed ? 'Prescription fully dispensed' : 'Prescription partially dispensed',
      data: {
        prescription: updatedPrescription
      }
    });
  } catch (error) {
    console.error('Partial dispense prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while partially dispensing prescription'
    });
  }
});

// @desc    Get medicine inventory
// @route   GET /api/medicines
// @access  Private (Pharmacy)
router.get('/medicines', [
  protect,
  authorize('pharmacy')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.lowStock === 'true') {
      // This will be handled in the query
    }

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { genericName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    let query = Medicine.find(filter);
    
    // Handle low stock filter
    if (req.query.lowStock === 'true') {
      query = query.where('stock').lte('minimumStock');
    }

    const medicines = await query
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Medicine.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: medicines.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        medicines
      }
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medicines'
    });
  }
});

// @desc    Update medicine stock
// @route   PUT /api/medicines/:id/stock
// @access  Private (Pharmacy)
router.put('/medicines/:id/stock', [
  protect,
  authorize('pharmacy'),
  [
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('operation')
      .isIn(['add', 'set'])
      .withMessage('Operation must be either add or set')
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

    const { stock, operation } = req.body;

    // Check if medicine exists
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    let newStock;
    if (operation === 'add') {
      newStock = medicine.stock + stock;
    } else {
      newStock = stock;
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { stock: newStock },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Medicine stock updated successfully',
      data: {
        medicine: updatedMedicine
      }
    });
  } catch (error) {
    console.error('Update medicine stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating medicine stock'
    });
  }
});

// @desc    Get pharmacy statistics
// @route   GET /api/pharmacy/stats
// @access  Private (Pharmacy)
router.get('/stats', [
  protect,
  authorize('pharmacy')
], async (req, res) => {
  try {
    const totalPrescriptions = await Prescription.countDocuments();
    const pendingPrescriptions = await Prescription.countDocuments({ pharmacyStatus: 'pending' });
    const dispensedPrescriptions = await Prescription.countDocuments({ pharmacyStatus: 'dispensed' });
    
    const todayDispensed = await Prescription.countDocuments({
      dispensedBy: req.user._id,
      dispensedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const weeklyDispensed = await Prescription.aggregate([
      {
        $match: {
          dispensedBy: req.user._id,
          dispensedAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$dispensedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const lowStockMedicines = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minimumStock'] }
    }).select('name stock minimumStock');

    const totalRevenue = await Prescription.aggregate([
      {
        $match: { pharmacyStatus: 'dispensed' }
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
        pendingPrescriptions,
        dispensedPrescriptions,
        todayDispensed,
        weeklyDispensed,
        lowStockMedicines,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Pharmacy stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pharmacy statistics'
    });
  }
});

module.exports = router;
