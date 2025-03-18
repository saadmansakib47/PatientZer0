const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const healthGoalController = require('../controllers/healthGoalController');

// All routes require authentication
router.use(authenticateJWT);

// Get all health goals for the authenticated user
router.get('/', healthGoalController.getHealthGoals);

// Create a new health goal
router.post('/', healthGoalController.createHealthGoal);

// Get a single health goal
router.get('/:id', healthGoalController.getHealthGoal);

// Update a health goal
router.put('/:id', healthGoalController.updateHealthGoal);

// Delete a health goal
router.delete('/:id', healthGoalController.deleteHealthGoal);

// Update goal progress
router.patch('/:id/progress', healthGoalController.updateGoalProgress);

module.exports = router; 