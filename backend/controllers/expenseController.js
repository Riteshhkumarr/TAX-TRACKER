const path = require('path');
const Expense = require('../models/Expense');
const upload = require('../middleware/upload');

// ─── Get All Expenses ──────────────────────────────────────────────────────
exports.getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, category, isDeductible,
      startDate, endDate, paymentMethod, sortBy = 'date', order = 'desc'
    } = req.query;

    const query = { userId: req.user._id };

    if (category) query.category = { $regex: category, $options: 'i' };
    if (isDeductible !== undefined) query.isDeductible = isDeductible === 'true';
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Create Expense ────────────────────────────────────────────────────────
exports.createExpense = async (req, res, next) => {
  try {
    const {
      title, amount, category, subCategory, date, description,
      isDeductible, deductionPercentage, receipt, vendor, paymentMethod, tags
    } = req.body;

    if (!title || !amount || !date) {
      return res.status(400).json({ success: false, message: 'Title, amount, and date are required.' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount: parseFloat(amount),
      category: category || 'Other',
      subCategory,
      date: new Date(date),
      description,
      isDeductible: isDeductible || false,
      deductionPercentage: isDeductible ? parseFloat(deductionPercentage || 100) : 0,
      receipt,
      vendor,
      paymentMethod: paymentMethod || 'other',
      tags: tags || []
    });

    res.status(201).json({ success: true, message: 'Expense added successfully.', data: expense });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Expense ────────────────────────────────────────────────────
exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// ─── Update Expense ────────────────────────────────────────────────────────
exports.updateExpense = async (req, res, next) => {
  try {
    const allowedFields = [
      'title', 'amount', 'category', 'subCategory', 'date', 'description',
      'isDeductible', 'deductionPercentage', 'receipt', 'vendor', 'paymentMethod', 'tags'
    ];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (updates.amount) updates.amount = parseFloat(updates.amount);
    if (updates.date) updates.date = new Date(updates.date);

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    res.json({ success: true, message: 'Expense updated successfully.', data: expense });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Expense ────────────────────────────────────────────────────────
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }
    res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── Upload Receipt ────────────────────────────────────────────────────────
exports.uploadReceipt = async (req, res, next) => {
  const uploadSingle = upload.single('receipt');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // If expenseId is provided, update the expense with the receipt URL
    if (req.body.expenseId) {
      try {
        await Expense.findOneAndUpdate(
          { _id: req.body.expenseId, userId: req.user._id },
          { $set: { receipt: fileUrl } }
        );
      } catch (updateErr) {
        console.error('Failed to update expense receipt:', updateErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Receipt uploaded successfully.',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
  });
};

// ─── Category Analytics ────────────────────────────────────────────────────
exports.getCategoryAnalytics = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const data = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59`)
          }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          deductibleTotal: {
            $sum: {
              $cond: [
                '$isDeductible',
                { $multiply: ['$amount', { $divide: ['$deductionPercentage', 100] }] },
                0
              ]
            }
          }
        }
      },
      { $sort: { total: -1 } },
      {
        $project: {
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          deductibleTotal: { $round: ['$deductibleTotal', 2] },
          _id: 0
        }
      }
    ]);

    const grandTotal = data.reduce((sum, d) => sum + d.total, 0);
    const result = data.map((d) => ({
      ...d,
      percentage: grandTotal > 0 ? Math.round((d.total / grandTotal) * 10000) / 100 : 0
    }));

    res.json({ success: true, year, data: result, grandTotal: Math.round(grandTotal * 100) / 100 });
  } catch (error) {
    next(error);
  }
};

// ─── Monthly Analytics ─────────────────────────────────────────────────────
exports.getMonthlyAnalytics = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const data = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          deductibleTotal: {
            $sum: {
              $cond: [
                '$isDeductible',
                { $multiply: ['$amount', { $divide: ['$deductionPercentage', 100] }] },
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
          deductibleTotal: { $round: ['$deductibleTotal', 2] },
          _id: 0
        }
      }
    ]);

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const found = data.find((d) => d.month === i + 1);
      return found || { month: i + 1, total: 0, count: 0, deductibleTotal: 0 };
    });

    res.json({ success: true, year, data: monthlyData });
  } catch (error) {
    next(error);
  }
};
