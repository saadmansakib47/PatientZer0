const mongoose = require('mongoose');

const healthActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['checkup', 'test', 'procedure', 'medication', 'exercise', 'other']
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: String,
  location: String,
  provider: String,
  attachments: [{
    type: String, // URLs to attached files
    description: String
  }],
  notes: String
});

module.exports = mongoose.model('HealthActivity', healthActivitySchema); 