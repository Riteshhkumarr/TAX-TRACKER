const Income = require('../models/Income');

// ─── Get All Incomes ──────────────────────────────────────────────────────
exports.getIncomes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate, sortBy = 'date', order = 'desc' } = req.query;

    const query = { userId: req.user._id };

    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [incomes, total] = await Promise.all([
      Income.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Income.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: incomes,
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

// ─── Create Income ─────────────────────────────────────────────────────────
exports.createIncome = async (req, res, next) => {
  try {
    const { source, category, amount, currency, date, description, isRecurring, recurringFrequency, taxable, attachments } = req.body;

    if (!source || !amount || !date) {
      return res.status(400).json({ success: false, message: 'Source, amount, and date are required.' });
    }

    const income = await Income.create({
      userId: req.user._id,
      source,
      category: category || 'other',
      amount: parseFloat(amount),
      currency: currency || req.user.currency || 'USD',
      date: new Date(date),
      description,
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      taxable: taxable !== undefined ? taxable : true,
      attachments: attachments || []
    });

    res.status(201).json({ success: true, message: 'Income added successfully.', data: income });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Income ─────────────────────────────────────────────────────
exports.getIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found.' });
    }
    res.json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// ─── Update Income ─────────────────────────────────────────────────────────
exports.updateIncome = async (req, res, next) => {
  try {
    const allowedFields = ['source', 'category', 'amount', 'currency', 'date', 'description', 'isRecurring', 'recurringFrequency', 'taxable', 'attachments'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (updates.amount) updates.amount = parseFloat(updates.amount);
    if (updates.date) updates.date = new Date(updates.date);

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found.' });
    }

    res.json({ success: true, message: 'Income updated successfully.', data: income });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Income ─────────────────────────────────────────────────────────
exports.deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) {
      return res.status(404).json({ success: false, message: 'Income record not found.' });
    }
    res.json({ success: true, message: 'Income deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── Monthly Analytics ─────────────────────────────────────────────────────
exports.getMonthlyAnalytics = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const data = await Income.aggregate([
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
          _id: {
            month: { $month: '$date' },
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          total: { $sum: '$total' },
          count: { $sum: '$count' },
          categories: {
            $push: {
              category: '$_id.category',
              total: '$total',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          total: 1,
          count: 1,
          categories: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing months with zeros
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const found = data.find((d) => d.month === i + 1);
      return found || { month: i + 1, total: 0, count: 0, categories: [] };
    });

    res.json({ success: true, year, data: monthlyData });
  } catch (error) {
    next(error);
  }
};

// ─── Yearly Analytics ─────────────────────────────────────────────────────
exports.getYearlyAnalytics = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;

    const data = await Income.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: {
            $gte: new Date(`${startYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31T23:59:59`)
          }
        }
      },
      {
        $group: {
          _id: { $year: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          taxable: {
            $sum: { $cond: ['$taxable', '$amount', 0] }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          year: '$_id',
          total: 1,
          count: 1,
          taxable: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing years
    const yearlyData = [];
    for (let y = startYear; y <= currentYear; y++) {
      const found = data.find((d) => d.year === y);
      yearlyData.push(found || { year: y, total: 0, count: 0, taxable: 0 });
    }

    res.json({ success: true, data: yearlyData });
  } catch (error) {
    next(error);
  }
};
