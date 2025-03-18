const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const healthActivityController = require('../controllers/healthActivityController');

// All routes require authentication
router.use(authenticateJWT);

// Get all health activities for the authenticated user
router.get('/', healthActivityController.getHealthActivities);

// Create a new health activity
router.post('/', healthActivityController.createHealthActivity);

// Get a single health activity
router.get('/:id', healthActivityController.getHealthActivity);

// Update a health activity
router.put('/:id', healthActivityController.updateHealthActivity);

// Delete a health activity
router.delete('/:id', healthActivityController.deleteHealthActivity);

// Get recent activities (last 30 days)
router.get('/recent', healthActivityController.getRecentActivities);

module.exports = router; 