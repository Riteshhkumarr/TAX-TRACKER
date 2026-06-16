const Income = require('../models/Income');
const Expense = require('../models/Expense');
const TaxRecord = require('../models/TaxRecord');
const { calculateFederalTax, getQuarterlyDeadlines, STANDARD_DEDUCTION_2024 } = require('../utils/taxBrackets');

// ─── Calculate Tax ─────────────────────────────────────────────────────────
exports.calculateTax = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const userId = req.user._id;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    // Fetch total taxable income
    const incomeAgg = await Income.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate },
          taxable: true
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Fetch all income (including non-taxable)
    const allIncomeAgg = await Income.aggregate([
      {
        $match: { userId, date: { $gte: startDate, $lte: endDate } }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Fetch total deductible expenses
    const deductionAgg = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lte: endDate },
          isDeductible: true
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ['$amount', { $divide: ['$deductionPercentage', 100] }] }
          }
        }
      }
    ]);

    // Fetch total expenses
    const expenseAgg = await Expense.aggregate([
      {
        $match: { userId, date: { $gte: startDate, $lte: endDate } }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = allIncomeAgg[0]?.total || 0;
    const taxableGrossIncome = incomeAgg[0]?.total || 0;
    const totalDeductions = Math.round((deductionAgg[0]?.total || 0) * 100) / 100;
    const totalExpenses = expenseAgg[0]?.total || 0;

    // Use standard deduction if it's higher than itemized
    const standardDeduction = STANDARD_DEDUCTION_2024;
    const itemizedDeduction = totalDeductions;
    const applicableDeduction = Math.max(standardDeduction, itemizedDeduction);

    const taxableIncome = Math.max(0, taxableGrossIncome - applicableDeduction);

    const taxCalc = calculateFederalTax(taxableIncome);

    // Upsert TaxRecord
    const taxRecord = await TaxRecord.findOneAndUpdate(
      { userId, year, quarter: 'Annual' },
      {
        $set: {
          totalIncome: Math.round(totalIncome * 100) / 100,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          totalDeductions: Math.round(applicableDeduction * 100) / 100,
          taxableIncome: Math.round(taxableIncome * 100) / 100,
          estimatedTax: taxCalc.totalTax,
          balance: Math.round((taxCalc.totalTax - 0) * 100) / 100,
          dueDate: new Date(`${year + 1}-04-15`)
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      year,
      data: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        taxableGrossIncome: Math.round(taxableGrossIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        standardDeduction,
        itemizedDeduction: Math.round(itemizedDeduction * 100) / 100,
        applicableDeduction: Math.round(applicableDeduction * 100) / 100,
        taxableIncome: taxCalc.taxableIncome,
        estimatedTax: taxCalc.totalTax,
        effectiveRate: taxCalc.effectiveRate,
        marginalRate: taxCalc.marginalRate,
        taxBreakdown: taxCalc.breakdown,
        taxRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Tax Records ───────────────────────────────────────────────────
exports.getTaxRecords = async (req, res, next) => {
  try {
    const records = await TaxRecord.find({ userId: req.user._id })
      .sort({ year: -1, quarter: 1 });

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

// ─── Get Tax Record By Year ────────────────────────────────────────────────
exports.getTaxRecordByYear = async (req, res, next) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) {
      return res.status(400).json({ success: false, message: 'Invalid year parameter.' });
    }

    const records = await TaxRecord.find({ userId: req.user._id, year }).sort({ quarter: 1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ success: false, message: `No tax records found for ${year}.` });
    }

    res.json({ success: true, year, data: records });
  } catch (error) {
    next(error);
  }
};

// ─── Update Tax Record ─────────────────────────────────────────────────────
exports.updateTaxRecord = async (req, res, next) => {
  try {
    const allowedFields = ['taxPaid', 'status', 'filedDate', 'notes'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (updates.filedDate) updates.filedDate = new Date(updates.filedDate);

    // Recalculate balance if taxPaid is being updated
    const record = await TaxRecord.findOne({ _id: req.params.id, userId: req.user._id });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Tax record not found.' });
    }

    if (updates.taxPaid !== undefined) {
      updates.balance = Math.round((record.estimatedTax - parseFloat(updates.taxPaid)) * 100) / 100;
    }

    const updatedRecord = await TaxRecord.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Tax record updated.', data: updatedRecord });
  } catch (error) {
    next(error);
  }
};

// ─── Get Deadlines ─────────────────────────────────────────────────────────
exports.getDeadlines = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const deadlines = getQuarterlyDeadlines(year);

    const now = new Date();
    const enriched = deadlines.map((d) => ({
      ...d,
      isPast: d.dueDate < now,
      daysUntilDue: Math.ceil((d.dueDate - now) / (1000 * 60 * 60 * 24))
    }));

    // Fetch existing tax records to show filing status
    const records = await TaxRecord.find({ userId: req.user._id, year });

    const result = enriched.map((deadline) => {
      const record = records.find((r) => r.quarter === deadline.quarter);
      return {
        ...deadline,
        status: record?.status || 'pending',
        estimatedTax: record?.estimatedTax || null,
        taxPaid: record?.taxPaid || null
      };
    });

    res.json({ success: true, year, data: result });
  } catch (error) {
    next(error);
  }
};
