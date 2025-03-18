const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['heartRate', 'bloodPressure', 'bloodSugar', 'oxygenLevel', 'cholesterol', 'other']
  },
  value: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
});

module.exports = mongoose.model('HealthMetric', healthMetricSchema); 