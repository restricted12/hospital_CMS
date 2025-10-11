const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'other'],
      message: 'Gender must be one of: male, female, other'
    }
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150']
  },
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country name cannot exceed 50 characters'],
      default: 'USA'
    }
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Registered by field is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

// Index for better search performance
patientSchema.index({ firstName: 'text', lastName: 'text' });
patientSchema.index({ 'contact.phone': 1 });
patientSchema.index({ 'contact.email': 1 });

module.exports = mongoose.model('Patient', patientSchema);
