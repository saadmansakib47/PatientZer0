const mongoose = require('mongoose');

const healthGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  notes: String
});

module.exports = mongoose.model('HealthGoal', healthGoalSchema); 