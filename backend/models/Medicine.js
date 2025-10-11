const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Medicine name cannot exceed 100 characters']
  },
  genericName: {
    type: String,
    trim: true,
    maxlength: [100, 'Generic name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minimumStock: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['tablet', 'capsule', 'ml', 'mg', 'g', 'piece', 'bottle', 'tube'],
      message: 'Unit must be one of: tablet, capsule, ml, mg, g, piece, bottle, tube'
    },
    default: 'tablet'
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Batch number cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
medicineSchema.index({ name: 'text', genericName: 'text' });
medicineSchema.index({ category: 1 });
medicineSchema.index({ isActive: 1 });
medicineSchema.index({ stock: 1 });

// Virtual for low stock alert
medicineSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.minimumStock;
});

// Ensure virtual fields are serialized
medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
