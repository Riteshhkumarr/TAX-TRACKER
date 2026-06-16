const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    source: {
      type: String,
      required: [true, 'Income source is required'],
      trim: true,
      maxlength: [200, 'Source cannot exceed 200 characters']
    },
    category: {
      type: String,
      enum: ['salary', 'freelance', 'investment', 'rental', 'business', 'other'],
      default: 'other'
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      maxlength: 3
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly', null],
      default: null
    },
    taxable: {
      type: Boolean,
      default: true
    },
    attachments: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient user+date queries
incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, category: 1 });

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;
