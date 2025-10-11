const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Visit = require('../models/Visit');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create payment record
// @route   POST /api/payments
// @access  Private (Reception)
router.post('/', [
  protect,
  authorize('reception', 'admin'),
  [
    body('visit')
      .isMongoId()
      .withMessage('Valid visit ID is required'),
    body('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .isFloat({ min: 0 })
      .withMessage('Amount cannot be negative'),
    body('paymentType')
      .isIn(['consultation', 'lab', 'medicine', 'other'])
      .withMessage('Invalid payment type'),
    body('paymentMethod')
      .isIn(['cash', 'card', 'insurance', 'online'])
      .withMessage('Invalid payment method'),
    body('transactionId')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Transaction ID cannot exceed 100 characters'),
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

    const { visit, amount, paymentType, paymentMethod, transactionId, notes } = req.body;

    // Check if visit exists
    const visitExists = await Visit.findById(visit);
    if (!visitExists) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      visit,
      amount,
      paymentType,
      paymentMethod,
      transactionId,
      notes,
      receivedBy: req.user._id,
      isPaid: true,
      paidAt: new Date()
    });

    // Update visit total cost and paid status
    const updatedVisit = await Visit.findByIdAndUpdate(
      visit,
      {
        totalCost: visitExists.totalCost + amount,
        paid: true
      },
      { new: true, runValidators: true }
    ).populate('patient', 'firstName lastName');

    // Populate payment data
    await payment.populate('visit', 'visitNumber')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName'
        }
      })
      .populate('receivedBy', 'fullName role');

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment,
        visit: updatedVisit
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment creation'
    });
  }
});

// @desc    View payments by visit
// @route   GET /api/payments/visit/:visitId
// @access  Private
router.get('/visit/:visitId', [
  protect
], async (req, res) => {
  try {
    const payments = await Payment.find({ visit: req.params.visitId })
      .populate('receivedBy', 'fullName role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: {
        payments
      }
    });
  } catch (error) {
    console.error('Get payments by visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments'
    });
  }
});

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Reception, Admin)
router.get('/', [
  protect,
  authorize('reception', 'admin')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.paymentType) {
      filter.paymentType = req.query.paymentType;
    }
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }
    if (req.query.isPaid !== undefined) {
      filter.isPaid = req.query.isPaid === 'true';
    }
    if (req.query.receivedBy) {
      filter.receivedBy = req.query.receivedBy;
    }

    // Date filtering
    if (req.query.startDate) {
      filter.createdAt = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      filter.createdAt = { 
        ...filter.createdAt, 
        $lte: new Date(req.query.endDate) 
      };
    }

    const payments = await Payment.find(filter)
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact'
        }
      })
      .populate('receivedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        payments
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payments'
    });
  }
});

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private (Reception, Admin)
router.get('/:id', [
  protect,
  authorize('reception', 'admin')
], async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('visit', 'visitNumber visitDate')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName gender age contact address'
        }
      })
      .populate('receivedBy', 'fullName role');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment'
    });
  }
});

// @desc    Mark payment as paid
// @route   PUT /api/payments/:id/confirm
// @access  Private (Reception, Admin)
router.put('/:id/confirm', [
  protect,
  authorize('reception', 'admin')
], async (req, res) => {
  try {
    // Check if payment exists
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if already paid
    if (payment.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Payment is already confirmed'
      });
    }

    // Update payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        isPaid: true,
        paidAt: new Date()
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
     .populate('receivedBy', 'fullName role');

    // Update visit paid status
    await Visit.findByIdAndUpdate(
      payment.visit,
      { paid: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        payment: updatedPayment
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming payment'
    });
  }
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private (Reception, Admin)
router.put('/:id', [
  protect,
  authorize('reception', 'admin'),
  [
    body('amount')
      .optional()
      .isNumeric()
      .withMessage('Amount must be a number')
      .isFloat({ min: 0 })
      .withMessage('Amount cannot be negative'),
    body('paymentType')
      .optional()
      .isIn(['consultation', 'lab', 'medicine', 'other'])
      .withMessage('Invalid payment type'),
    body('paymentMethod')
      .optional()
      .isIn(['cash', 'card', 'insurance', 'online'])
      .withMessage('Invalid payment method'),
    body('transactionId')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Transaction ID cannot exceed 100 characters'),
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

    // Check if payment exists
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('visit', 'visitNumber')
     .populate({
       path: 'visit',
       populate: {
         path: 'patient',
         select: 'firstName lastName'
       }
     })
     .populate('receivedBy', 'fullName role');

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: {
        payment: updatedPayment
      }
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment'
    });
  }
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private (Admin only)
router.delete('/:id', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    // Check if payment exists
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting payment'
    });
  }
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats/overview
// @access  Private (Reception, Admin)
router.get('/stats/overview', [
  protect,
  authorize('reception', 'admin')
], async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const paymentTypeStats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const paymentMethodStats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const dailyRevenue = await Payment.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        paymentTypeStats,
        paymentMethodStats,
        dailyRevenue,
        todayRevenue: todayRevenue[0] || { count: 0, total: 0 }
      }
    });
  } catch (error) {
    console.error('Payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment statistics'
    });
  }
});

module.exports = router;
