const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { createReport, getAllReports, updateStatus } = require('../controllers/reportController');

// Public — anyone can submit a report (auth optional)
router.post('/', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    authenticate(req, res, () => createReport(req, res, next));
  } else {
    createReport(req, res, next);
  }
});

// Admin only
router.get('/', authenticate, requireAdmin, getAllReports);
router.patch('/:id/status', authenticate, requireAdmin, updateStatus);

module.exports = router;
