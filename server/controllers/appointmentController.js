const Appointment = require('../models/Appointment');

// Get all appointments for a user
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { doctorName, specialization, date, time, notes, reminder } = req.body;
    const appointment = new Appointment({
      userId: req.user._id,
      doctorName,
      specialization,
      date,
      time,
      notes,
      reminder
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment' });
  }
};

// Get a single appointment
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment' });
  }
};

// Update an appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { doctorName, specialization, date, time, status, notes, reminder } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { doctorName, specialization, date, time, status, notes, reminder },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment' });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
};

// Get upcoming appointments
exports.getUpcomingAppointments = async (req, res) => {
  try {
    // Verify user exists
    if (!req.user || !req.user._id) {
      console.error('User not found in request:', req.user);
      return res.status(401).json({ 
        message: 'User not authenticated',
        error: 'User object not found in request'
      });
    }

    console.log('Fetching upcoming appointments for user:', req.user._id);
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for accurate date comparison
    
    console.log('Current date for comparison:', currentDate);

    // First, try to find all appointments for the user to verify the query
    const allAppointments = await Appointment.find({ userId: req.user._id });
    console.log('Total appointments found:', allAppointments.length);

    // Log the query parameters
    const query = {
      userId: req.user._id,
      date: { $gte: currentDate },
      status: { $ne: 'cancelled' }
    };
    console.log('Query parameters:', JSON.stringify(query, null, 2));

    const appointments = await Appointment.find(query)
      .sort({ date: 1, time: 1 });

    console.log('Upcoming appointments found:', appointments.length);
    res.json(appointments);
  } catch (error) {
    console.error('Detailed error in getUpcomingAppointments:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    // Check for specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid date format',
        error: error.message
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({ 
      message: 'Error fetching upcoming appointments',
      error: error.message,
      details: error.stack
    });
  }
}; 