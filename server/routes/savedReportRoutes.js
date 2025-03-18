const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const savedReportController = require('../controllers/savedReportController');

// All routes require authentication
router.use(authenticateJWT);

// Get all saved reports for the authenticated user
router.get('/', savedReportController.getSavedReports);

// Save a new report
router.post('/', savedReportController.saveReport);

// Get a single saved report
router.get('/:id', savedReportController.getSavedReport);

// Update a saved report
router.put('/:id', savedReportController.updateSavedReport);

// Delete a saved report
router.delete('/:id', savedReportController.deleteSavedReport);

module.exports = router; 