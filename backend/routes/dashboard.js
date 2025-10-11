const express = require('express');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Payment = require('../models/Payment');
const Prescription = require('../models/Prescription');
const LabTest = require('../models/LabTest');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private (Admin, Reception)
router.get('/overview', [
  protect,
  authorize('admin', 'reception')
], async (req, res) => {
  try {
    // Get basic counts
    const [
      totalPatients,
      totalVisits,
      totalUsers,
      totalPayments
    ] = await Promise.all([
      Patient.countDocuments(),
      Visit.countDocuments(),
      User.countDocuments({ isActive: true }),
      Payment.countDocuments({ isPaid: true })
    ]);

    // Get revenue data
    const revenueData = await Payment.aggregate([
      {
        $match: { isPaid: true }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          todayRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))] },
                    { $lt: ['$createdAt', new Date(new Date().setHours(23, 59, 59, 999))] }
                  ]
                },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    // Get visit status distribution
    const visitStatusStats = await Visit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user role distribution
    const userRoleStats = await User.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activities
    const recentVisits = await Visit.find()
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find({ isPaid: true })
      .populate('visit', 'visitNumber')
      .populate({
        path: 'visit',
        populate: {
          path: 'patient',
          select: 'firstName lastName'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalPatients,
          totalVisits,
          totalUsers,
          totalPayments,
          totalRevenue: revenueData[0]?.totalRevenue || 0,
          todayRevenue: revenueData[0]?.todayRevenue || 0
        },
        visitStatusStats,
        userRoleStats,
        recentVisits,
        recentPayments
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard overview'
    });
  }
});

// @desc    Get revenue chart data
// @route   GET /api/dashboard/revenue
// @access  Private (Admin, Reception)
router.get('/revenue', [
  protect,
  authorize('admin', 'reception')
], async (req, res) => {
  try {
    const period = req.query.period || '7d'; // 7d, 30d, 90d, 1y
    let dateFilter = {};
    
    // Calculate date range based on period
    const now = new Date();
    switch (period) {
      case '7d':
        dateFilter = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
        break;
      case '30d':
        dateFilter = {
          $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        };
        break;
      case '90d':
        dateFilter = {
          $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        };
        break;
      case '1y':
        dateFilter = {
          $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        };
        break;
      default:
        dateFilter = {
          $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        };
    }

    // Get daily revenue data
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get revenue by payment type
    const revenueByType = await Payment.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$paymentType',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly revenue (for longer periods)
    let monthlyRevenue = [];
    if (period === '90d' || period === '1y') {
      monthlyRevenue = await Payment.aggregate([
        {
          $match: {
            isPaid: true,
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$createdAt' }
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        period,
        dailyRevenue,
        revenueByType,
        revenueByMethod,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Dashboard revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching revenue data'
    });
  }
});

// @desc    Get patient analytics
// @route   GET /api/dashboard/patients
// @access  Private (Admin, Reception)
router.get('/patients', [
  protect,
  authorize('admin', 'reception')
], async (req, res) => {
  try {
    // Patient registration trends
    const registrationTrends = await Patient.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    // Gender distribution
    const genderDistribution = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Age group distribution
    const ageGroupDistribution = await Patient.aggregate([
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

    // Top registered by users
    const topRegisteredBy = await Patient.aggregate([
      {
        $group: {
          _id: '$registeredBy',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          count: 1,
          user: {
            fullName: '$user.fullName',
            role: '$user.role'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        registrationTrends,
        genderDistribution,
        ageGroupDistribution,
        topRegisteredBy
      }
    });
  } catch (error) {
    console.error('Dashboard patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient analytics'
    });
  }
});

// @desc    Get visit analytics
// @route   GET /api/dashboard/visits
// @access  Private (Admin, Reception)
router.get('/visits', [
  protect,
  authorize('admin', 'reception')
], async (req, res) => {
  try {
    // Visit trends
    const visitTrends = await Visit.aggregate([
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

    // Visit status distribution
    const visitStatusDistribution = await Visit.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average visit duration (from creation to completion)
    const visitDurationStats = await Visit.aggregate([
      {
        $match: { status: 'done' }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' }
        }
      }
    ]);

    // Top checker doctors
    const topCheckerDoctors = await Visit.aggregate([
      {
        $match: { checkerDoctor: { $exists: true } }
      },
      {
        $group: {
          _id: '$checkerDoctor',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          count: 1,
          user: {
            fullName: '$user.fullName',
            role: '$user.role'
          }
        }
      }
    ]);

    // Top main doctors
    const topMainDoctors = await Visit.aggregate([
      {
        $match: { mainDoctor: { $exists: true } }
      },
      {
        $group: {
          _id: '$mainDoctor',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          count: 1,
          user: {
            fullName: '$user.fullName',
            role: '$user.role'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        visitTrends,
        visitStatusDistribution,
        visitDurationStats: visitDurationStats[0] || {
          averageDuration: 0,
          minDuration: 0,
          maxDuration: 0
        },
        topCheckerDoctors,
        topMainDoctors
      }
    });
  } catch (error) {
    console.error('Dashboard visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visit analytics'
    });
  }
});

// @desc    Get system performance metrics
// @route   GET /api/dashboard/performance
// @access  Private (Admin only)
router.get('/performance', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    // Lab test completion rates
    const labTestStats = await LabTest.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: ['$isCompleted', 1, 0] }
          }
        }
      }
    ]);

    // Prescription dispensing rates
    const prescriptionStats = await Prescription.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          dispensed: {
            $sum: { $cond: [{ $eq: ['$pharmacyStatus', 'dispensed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$pharmacyStatus', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    // Payment success rate
    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          paid: {
            $sum: { $cond: ['$isPaid', 1, 0] }
          }
        }
      }
    ]);

    // Average processing times
    const processingTimes = await Visit.aggregate([
      {
        $match: { status: 'done' }
      },
      {
        $project: {
          registrationToCheck: {
            $divide: [
              { $subtract: ['$updatedAt', '$createdAt'] },
              1000 * 60 // Convert to minutes
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageProcessingTime: { $avg: '$registrationToCheck' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        labTestStats: labTestStats[0] || { total: 0, completed: 0 },
        prescriptionStats: prescriptionStats[0] || { total: 0, dispensed: 0, pending: 0 },
        paymentStats: paymentStats[0] || { total: 0, paid: 0 },
        processingTimes: processingTimes[0] || { averageProcessingTime: 0 }
      }
    });
  } catch (error) {
    console.error('Dashboard performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching performance metrics'
    });
  }
});

module.exports = router;
