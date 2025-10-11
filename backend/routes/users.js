const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin only)
router.get('/:id', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin only)
router.put('/:id', [
  protect,
  authorize('admin'),
  [
    body('fullName')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Full name cannot exceed 100 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('role')
      .optional()
      .isIn(['admin', 'reception', 'checkerDoctor', 'mainDoctor', 'labTech', 'pharmacy'])
      .withMessage('Invalid role'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
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

    const { fullName, email, role, isActive } = req.body;
    const updateFields = {};

    if (fullName) updateFields.fullName = fullName;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin only)
router.put('/:id/toggle-status', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !user.isActive },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling user status'
    });
  }
});

// @desc    Get users by role (Admin only)
// @route   GET /api/users/role/:role
// @access  Private (Admin only)
router.get('/role/:role', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    const { role } = req.params;
    
    const validRoles = ['admin', 'reception', 'checkerDoctor', 'mainDoctor', 'labTech', 'pharmacy'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const users = await User.find({ 
      role: role,
      isActive: true 
    })
    .select('-password')
    .sort({ fullName: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users by role'
    });
  }
});

module.exports = router;
