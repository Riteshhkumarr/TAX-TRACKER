const express = require('express');
const router = express.Router();

const {
  getIncomes,
  createIncome,
  getIncome,
  updateIncome,
  deleteIncome,
  getMonthlyAnalytics,
  getYearlyAnalytics
} = require('../controllers/incomeController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Analytics routes (before /:id to avoid conflicts)
router.get('/analytics/monthly', getMonthlyAnalytics);
router.get('/analytics/yearly', getYearlyAnalytics);

// CRUD routes
router.get('/', getIncomes);
router.post('/', createIncome);
router.get('/:id', getIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
