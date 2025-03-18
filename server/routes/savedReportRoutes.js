const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const savedReportController = require('../controllers/savedReportController');

// All routes require authentication
router.use(authenticateJWT);

// Get all saved reports for the authenticated user
router.get('/', (req, res) => savedReportController.getSavedReports(req, res));

// Save a new report
router.post('/', (req, res) => savedReportController.saveReport(req, res));

// Get a single saved report
router.get('/:id', (req, res) => savedReportController.getSavedReport(req, res));

// Update a saved report
router.put('/:id', (req, res) => savedReportController.updateSavedReport(req, res));

// Delete a saved report
router.delete('/:id', (req, res) => savedReportController.deleteSavedReport(req, res));

module.exports = router; 