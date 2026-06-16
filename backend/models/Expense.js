const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Other'
    },
    subCategory: {
      type: String,
      trim: true,
      maxlength: [100, 'Sub-category cannot exceed 100 characters']
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
    isDeductible: {
      type: Boolean,
      default: false
    },
    deductionPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Deduction percentage cannot be negative'],
      max: [100, 'Deduction percentage cannot exceed 100']
    },
    receipt: {
      type: String,
      default: null
    },
    vendor: {
      type: String,
      trim: true,
      maxlength: [200, 'Vendor name cannot exceed 200 characters']
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank', 'digital', 'other'],
      default: 'other'
    },
    tags: {
      type: [String],
      default: []
    },
    isAnomaly: {
      type: Boolean,
      default: false
    },
    aiConfidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    }
  },
  {
    timestamps: true
  }
);

// Indexes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, isDeductible: 1 });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
