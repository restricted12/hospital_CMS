const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true,
    maxlength: [50, 'Dosage cannot exceed 50 characters']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters']
  },
  instruction: {
    type: String,
    required: [true, 'Instruction is required'],
    trim: true,
    maxlength: [200, 'Instruction cannot exceed 200 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  visit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: [true, 'Visit reference is required']
  },
  mainDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Main doctor is required'],
    validate: {
      validator: function(v) {
        return this.mainDoctorRole === 'mainDoctor';
      },
      message: 'Main doctor must have mainDoctor role'
    }
  },
  medicines: [medicineSchema],
  pharmacyStatus: {
    type: String,
    required: [true, 'Pharmacy status is required'],
    enum: {
      values: ['pending', 'dispensed', 'partially_dispensed'],
      message: 'Pharmacy status must be one of: pending, dispensed, partially_dispensed'
    },
    default: 'pending'
  },
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        return !v || this.dispensedByRole === 'pharmacy';
      },
      message: 'Dispensed by must have pharmacy role'
    }
  },
  dispensedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  totalCost: {
    type: Number,
    default: 0,
    min: [0, 'Total cost cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
prescriptionSchema.index({ visit: 1 });
prescriptionSchema.index({ mainDoctor: 1 });
prescriptionSchema.index({ pharmacyStatus: 1 });
prescriptionSchema.index({ dispensedBy: 1 });

// Virtual for prescription number
prescriptionSchema.virtual('prescriptionNumber').get(function() {
  return `RX-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Ensure virtual fields are serialized
prescriptionSchema.set('toJSON', { virtuals: true });
prescriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
