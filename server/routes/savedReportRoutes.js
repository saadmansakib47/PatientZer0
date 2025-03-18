const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const {
  getSavedReports,
  saveReport,
  getReportById,
  updateReport,
  deleteReport,
} = require('../controllers/savedReportController');

// All routes require authentication
router.use(authenticateJWT);

// Get all saved reports for the user
router.get('/', getSavedReports);

// Save a new report
router.post('/', saveReport);

// Get a single report
router.get('/:id', getReportById);

// Update a report
router.put('/:id', updateReport);

// Delete a report
router.delete('/:id', deleteReport);

module.exports = router; 