const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    set: function(date) {
      // Ensure the date is properly set to the start of the day
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    }
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: String,
  reminder: {
    enabled: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: Number, // hours before appointment
      default: 24
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema); 