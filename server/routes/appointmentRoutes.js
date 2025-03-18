const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

// All routes require authentication
router.use(authenticateJWT);

// Get upcoming appointments (must come before /:id route)
router.get('/upcoming', appointmentController.getUpcomingAppointments);

// Get all appointments for the authenticated user
router.get('/', appointmentController.getAppointments);

// Create a new appointment
router.post('/', appointmentController.createAppointment);

// Get a single appointment
router.get('/:id', appointmentController.getAppointment);

// Update an appointment
router.put('/:id', appointmentController.updateAppointment);

// Delete an appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router; 