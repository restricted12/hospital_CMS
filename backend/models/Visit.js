const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
    default: Date.now
  },
  complaint: {
    type: String,
    required: [true, 'Patient complaint is required'],
    trim: true,
    maxlength: [1000, 'Complaint cannot exceed 1000 characters']
  },
  symptoms: {
    type: String,
    trim: true,
    maxlength: [1000, 'Symptoms cannot exceed 1000 characters']
  },
  diagnosis: {
    type: String,
    trim: true,
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  checkerDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  mainDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  labTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest'
  }],
  status: {
    type: String,
    required: [true, 'Visit status is required'],
    enum: {
      values: ['registered', 'checked', 'lab_pending', 'lab_done', 'diagnosed', 'done'],
      message: 'Status must be one of: registered, checked, lab_pending, lab_done, diagnosed, done'
    },
    default: 'registered'
  },
  totalCost: {
    type: Number,
    default: 0,
    min: [0, 'Total cost cannot be negative']
  },
  paid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
visitSchema.index({ patient: 1, visitDate: -1 });
visitSchema.index({ status: 1 });
visitSchema.index({ checkerDoctor: 1 });
visitSchema.index({ mainDoctor: 1 });
visitSchema.index({ visitDate: -1 });

// Virtual for visit number
visitSchema.virtual('visitNumber').get(function() {
  return `VISIT-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Ensure virtual fields are serialized
visitSchema.set('toJSON', { virtuals: true });
visitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Visit', visitSchema);
