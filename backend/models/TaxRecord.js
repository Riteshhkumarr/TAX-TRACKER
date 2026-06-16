const mongoose = require('mongoose');

const taxRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2000,
      max: 2100
    },
    quarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'],
      default: 'Annual'
    },
    totalIncome: {
      type: Number,
      default: 0,
      min: 0
    },
    totalExpenses: {
      type: Number,
      default: 0,
      min: 0
    },
    totalDeductions: {
      type: Number,
      default: 0,
      min: 0
    },
    taxableIncome: {
      type: Number,
      default: 0
    },
    estimatedTax: {
      type: Number,
      default: 0,
      min: 0
    },
    taxPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    balance: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'filed', 'paid'],
      default: 'pending'
    },
    dueDate: {
      type: Date
    },
    filedDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user + year + quarter
taxRecordSchema.index({ userId: 1, year: -1, quarter: 1 }, { unique: true });

const TaxRecord = mongoose.model('TaxRecord', taxRecordSchema);
module.exports = TaxRecord;
