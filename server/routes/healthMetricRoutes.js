const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const healthMetricController = require('../controllers/healthMetricController');

// All routes require authentication
router.use(authenticateJWT);

// Get all health metrics for the authenticated user
router.get('/', healthMetricController.getHealthMetrics);

// Create a new health metric
router.post('/', healthMetricController.createHealthMetric);

// Get a single health metric
router.get('/:id', healthMetricController.getHealthMetric);

// Update a health metric
router.put('/:id', healthMetricController.updateHealthMetric);

// Delete a health metric
router.delete('/:id', healthMetricController.deleteHealthMetric);

module.exports = router; 