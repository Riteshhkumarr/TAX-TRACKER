const express = require('express');
const router = express.Router();

const {
  getInsights,
  getFinancialScore,
  categorizeExpense,
  detectAnomalies,
  predictTax,
  chat
} = require('../controllers/aiController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/insights', getInsights);
router.get('/financial-score', getFinancialScore);
router.post('/categorize-expense', categorizeExpense);
router.get('/anomalies', detectAnomalies);
router.get('/tax-prediction', predictTax);
router.post('/chat', chat);

module.exports = router;
