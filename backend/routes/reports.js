const express = require('express');
const router = express.Router();

const {
  generatePDF,
  generateExcel,
  getSummary
} = require('../controllers/reportsController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/summary', getSummary);
router.get('/pdf/:year', generatePDF);
router.get('/excel/:year', generateExcel);

module.exports = router;
