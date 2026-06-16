const express = require('express');
const router = express.Router();

const {
  getExpenses,
  createExpense,
  getExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  getCategoryAnalytics,
  getMonthlyAnalytics
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Analytics & special routes (before /:id)
router.get('/analytics/categories', getCategoryAnalytics);
router.get('/analytics/monthly', getMonthlyAnalytics);
router.post('/upload-receipt', uploadReceipt);

// CRUD routes
router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
