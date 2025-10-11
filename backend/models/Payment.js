const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  visit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: [true, 'Visit reference is required']
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentType: {
    type: String,
    required: [true, 'Payment type is required'],
    enum: {
      values: ['consultation', 'lab', 'medicine', 'other'],
      message: 'Payment type must be one of: consultation, lab, medicine, other'
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['cash', 'card', 'insurance', 'online'],
      message: 'Payment method must be one of: cash, card, insurance, online'
    },
    default: 'cash'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Received by field is required']
  },
  transactionId: {
    type: String,
    trim: true,
    maxlength: [100, 'Transaction ID cannot exceed 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  paidAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
paymentSchema.index({ visit: 1 });
paymentSchema.index({ receivedBy: 1 });
paymentSchema.index({ paymentType: 1 });
paymentSchema.index({ isPaid: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for payment number
paymentSchema.virtual('paymentNumber').get(function() {
  return `PAY-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
