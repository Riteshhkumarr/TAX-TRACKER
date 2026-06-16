const axios = require('axios');
const Income = require('../models/Income');
const Expense = require('../models/Expense');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT = 10000; // 10 seconds

// Helper: call ML service
const callML = async (endpoint, data = {}, method = 'post') => {
  const response = await axios({
    method,
    url: `${ML_SERVICE_URL}${endpoint}`,
    data: method !== 'get' ? data : undefined,
    params: method === 'get' ? data : undefined,
    timeout: ML_TIMEOUT
  });
  return response.data;
};

// ─── Get Insights ──────────────────────────────────────────────────────────
exports.getInsights = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const userId = req.user._id;

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    const [incomeAgg, expenseAgg] = await Promise.all([
      Income.aggregate([
        { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ])
    ]);

    const userData = { userId: userId.toString(), year, incomeByCategory: incomeAgg, expenseByCategory: expenseAgg };

    let mlInsights;
    try {
      mlInsights = await callML('/insights', userData);
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback insights:', mlErr.message);
      const totalIncome = incomeAgg.reduce((s, i) => s + i.total, 0);
      const totalExpenses = expenseAgg.reduce((s, e) => s + e.total, 0);
      mlInsights = {
        insights: [
          {
            type: 'info',
            title: 'Savings Rate',
            message: totalIncome > 0
              ? `You saved ${Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)}% of your income this year.`
              : 'Start tracking your income to get savings insights.'
          },
          {
            type: 'tip',
            title: 'Tax Deductions',
            message: 'Review your business expenses — many may qualify for deductions.'
          },
          {
            type: 'alert',
            title: 'Quarterly Taxes',
            message: 'Ensure you have made your quarterly estimated tax payments to avoid penalties.'
          }
        ],
        generatedAt: new Date().toISOString(),
        source: 'fallback'
      };
    }

    res.json({ success: true, year, data: { ...mlInsights, userData } });
  } catch (error) {
    next(error);
  }
};

// ─── Financial Score ───────────────────────────────────────────────────────
exports.getFinancialScore = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const year = new Date().getFullYear();
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    const [incomeAgg, expenseAgg, deductionAgg] = await Promise.all([
      Income.aggregate([
        { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: startDate, $lte: endDate }, isDeductible: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$amount', { $divide: ['$deductionPercentage', 100] }] } } } }
      ])
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalDeductions = deductionAgg[0]?.total || 0;
    const incomeCount = incomeAgg[0]?.count || 0;

    const payload = { userId: userId.toString(), totalIncome, totalExpenses, totalDeductions, year, incomeCount };

    let scoreData;
    try {
      scoreData = await callML('/financial-score', payload);
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback financial score:', mlErr.message);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      const deductionRate = totalIncome > 0 ? (totalDeductions / totalIncome) * 100 : 0;

      let score = 50;
      if (savingsRate >= 20) score += 20;
      else if (savingsRate >= 10) score += 10;
      if (deductionRate >= 10) score += 15;
      if (incomeCount >= 6) score += 10;
      score = Math.min(100, score);

      scoreData = {
        score,
        grade: score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : 'D',
        breakdown: {
          savingsRate: Math.round(savingsRate * 100) / 100,
          deductionUtilization: Math.round(deductionRate * 100) / 100,
          incomeConsistency: incomeCount >= 6 ? 'Good' : 'Needs Improvement'
        },
        recommendations: [
          savingsRate < 20 ? 'Aim to save at least 20% of your income.' : 'Great savings rate!',
          deductionRate < 10 ? 'Maximize your deductible expenses.' : 'Good deduction utilization!'
        ],
        source: 'fallback'
      };
    }

    res.json({ success: true, data: scoreData });
  } catch (error) {
    next(error);
  }
};

// ─── Categorize Expense ────────────────────────────────────────────────────
exports.categorizeExpense = async (req, res, next) => {
  try {
    const { title, description, amount, vendor } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Expense title is required for categorization.' });
    }

    const payload = { title, description, amount, vendor };

    let result;
    try {
      result = await callML('/categorize', payload);
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback categorization:', mlErr.message);
      const text = `${title} ${description || ''} ${vendor || ''}`.toLowerCase();
      let category = 'Other';
      let isDeductible = false;
      let deductionPercentage = 0;

      if (/(office|supply|supplies|computer|software|subscription)/.test(text)) {
        category = 'Office Supplies'; isDeductible = true; deductionPercentage = 100;
      } else if (/(travel|flight|hotel|uber|lyft|gas|mileage)/.test(text)) {
        category = 'Travel'; isDeductible = true; deductionPercentage = 100;
      } else if (/(meal|restaurant|food|coffee|lunch|dinner)/.test(text)) {
        category = 'Meals'; isDeductible = true; deductionPercentage = 50;
      } else if (/(medical|doctor|pharmacy|health|hospital)/.test(text)) {
        category = 'Medical'; isDeductible = true; deductionPercentage = 100;
      } else if (/(rent|mortgage|utility|electric|internet|phone)/.test(text)) {
        category = 'Utilities';
      } else if (/(entertainment|netflix|spotify|game)/.test(text)) {
        category = 'Entertainment';
      } else if (/(insurance)/.test(text)) {
        category = 'Insurance'; isDeductible = true; deductionPercentage = 100;
      }

      result = {
        category,
        isDeductible,
        deductionPercentage,
        confidence: 0.7,
        alternatives: [{ category: 'Other', confidence: 0.3 }],
        source: 'fallback'
      };
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── Detect Anomalies ──────────────────────────────────────────────────────
exports.detectAnomalies = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 100;

    const expenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    if (expenses.length === 0) {
      return res.json({ success: true, data: { anomalies: [], message: 'No expenses to analyze.' } });
    }

    const payload = {
      userId: userId.toString(),
      expenses: expenses.map((e) => ({
        id: e._id.toString(),
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date,
        vendor: e.vendor
      }))
    };

    let result;
    try {
      result = await callML('/anomalies', payload);
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback anomaly detection:', mlErr.message);

      // Simple statistical anomaly detection
      const categoryGroups = {};
      expenses.forEach((e) => {
        if (!categoryGroups[e.category]) categoryGroups[e.category] = [];
        categoryGroups[e.category].push(e.amount);
      });

      const anomalies = [];
      expenses.forEach((e) => {
        const group = categoryGroups[e.category];
        if (group.length < 2) return;
        const mean = group.reduce((a, b) => a + b, 0) / group.length;
        const std = Math.sqrt(group.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / group.length);
        const zScore = std > 0 ? Math.abs((e.amount - mean) / std) : 0;
        if (zScore > 2) {
          anomalies.push({
            id: e._id.toString(),
            title: e.title,
            amount: e.amount,
            category: e.category,
            date: e.date,
            zScore: Math.round(zScore * 100) / 100,
            reason: `Amount is ${zScore.toFixed(1)} standard deviations above category average of $${mean.toFixed(2)}`
          });
        }
      });

      result = {
        anomalies,
        totalAnalyzed: expenses.length,
        source: 'fallback'
      };
    }

    // Update anomaly flags in database
    if (result.anomalies && result.anomalies.length > 0) {
      const anomalyIds = result.anomalies.map((a) => a.id);
      await Expense.updateMany(
        { _id: { $in: anomalyIds }, userId },
        { $set: { isAnomaly: true } }
      );
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── Predict Tax ───────────────────────────────────────────────────────────
exports.predictTax = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const monthlyIncome = await Income.aggregate([
      { $match: { userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyExpenses = await Expense.aggregate([
      { $match: { userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
          deductions: {
            $sum: { $cond: ['$isDeductible', { $multiply: ['$amount', { $divide: ['$deductionPercentage', 100] }] }, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const payload = {
      userId: userId.toString(),
      monthlyIncome,
      monthlyExpenses,
      user: { taxBracket: req.user.taxBracket, currency: req.user.currency }
    };

    let result;
    try {
      result = await callML('/predict-tax', payload);
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback tax prediction:', mlErr.message);
      const avgMonthlyIncome = monthlyIncome.length > 0
        ? monthlyIncome.reduce((s, m) => s + m.total, 0) / monthlyIncome.length
        : 0;
      const projectedAnnualIncome = avgMonthlyIncome * 12;
      const projectedAnnualExpenses = monthlyExpenses.length > 0
        ? (monthlyExpenses.reduce((s, m) => s + m.total, 0) / monthlyExpenses.length) * 12
        : 0;
      const projectedDeductions = monthlyExpenses.length > 0
        ? (monthlyExpenses.reduce((s, m) => s + m.deductions, 0) / monthlyExpenses.length) * 12
        : 0;

      const { calculateFederalTax } = require('../utils/taxBrackets');
      const taxCalc = calculateFederalTax(Math.max(0, projectedAnnualIncome - projectedDeductions));

      result = {
        projectedAnnualIncome: Math.round(projectedAnnualIncome * 100) / 100,
        projectedAnnualExpenses: Math.round(projectedAnnualExpenses * 100) / 100,
        projectedDeductions: Math.round(projectedDeductions * 100) / 100,
        projectedTaxableIncome: taxCalc.taxableIncome,
        projectedTax: taxCalc.totalTax,
        projectedEffectiveRate: taxCalc.effectiveRate,
        confidence: 0.75,
        source: 'fallback'
      };
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── Chat ──────────────────────────────────────────────────────────────────
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const payload = {
      message,
      conversationHistory,
      userId: req.user._id.toString(),
      userContext: {
        name: req.user.name,
        taxBracket: req.user.taxBracket,
        currency: req.user.currency
      }
    };

    let result;
    try {
      result = await callML('/chat', payload);
    } catch (mlErr) {
      console.warn('ML service unavailable, using fallback chat:', mlErr.message);
      const msg = message.toLowerCase();
      let reply = "I'm your AI tax assistant. I can help you with tax questions, expense categorization, and financial insights. How can I help you today?";

      if (/(deduction|deduct)/.test(msg)) {
        reply = "Tax deductions reduce your taxable income. Common deductions include business expenses, home office costs (if self-employed), and charitable donations. Would you like to know more about a specific type?";
      } else if (/(bracket|rate|tax rate)/.test(msg)) {
        reply = "For 2024, US federal tax brackets range from 10% (up to $11,600) to 37% (over $609,350). Your effective rate—what you actually pay on average—is typically lower than your marginal rate.";
      } else if (/(quarterly|estimated)/.test(msg)) {
        reply = "Quarterly estimated taxes are due April 15, June 17, September 16 (2024), and January 15, 2025. If you're self-employed or have significant non-wage income, you likely need to make these payments.";
      } else if (/(deadline|due date)/.test(msg)) {
        reply = "The standard tax filing deadline for 2024 returns is April 15, 2025. You can request a 6-month extension, but any taxes owed are still due by April 15.";
      }

      result = { reply, source: 'fallback' };
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
