const express = require('express');
const router = express.Router();

const {
  calculateTax,
  getTaxRecords,
  getTaxRecordByYear,
  updateTaxRecord,
  getDeadlines
} = require('../controllers/taxController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/calculate', calculateTax);
router.get('/deadlines', getDeadlines);
router.get('/records', getTaxRecords);
router.get('/records/:year', getTaxRecordByYear);
router.put('/records/:id', updateTaxRecord);

module.exports = router;
