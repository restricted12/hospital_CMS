const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  visit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: [true, 'Visit reference is required']
  },
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true,
    maxlength: [100, 'Test name cannot exceed 100 characters']
  },
  testType: {
    type: String,
    required: [true, 'Test type is required'],
    enum: {
      values: ['blood', 'urine', 'xray', 'ct', 'mri', 'ultrasound', 'other'],
      message: 'Test type must be one of: blood, urine, xray, ct, mri, ultrasound, other'
    }
  },
  result: {
    type: String,
    trim: true,
    maxlength: [2000, 'Test result cannot exceed 2000 characters']
  },
  fileUrl: {
    type: String,
    trim: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Only required once a test is completed (set by lab tech during result upload)
    required: function() { return this.isCompleted === true; }
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  cost: {
    type: Number,
    default: 0,
    min: [0, 'Cost cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
labTestSchema.index({ visit: 1 });
labTestSchema.index({ performedBy: 1 });
labTestSchema.index({ isCompleted: 1 });
labTestSchema.index({ testType: 1 });

// Virtual for test number
labTestSchema.virtual('testNumber').get(function() {
  return `LAB-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Ensure virtual fields are serialized
labTestSchema.set('toJSON', { virtuals: true });
labTestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('LabTest', labTestSchema);
