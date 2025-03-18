const mongoose = require('mongoose');

const savedReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    scanData: {
      type: Object,
      required: true,
    },
    scanType: {
      type: String,
      required: true,
      enum: ["xray", "mri", "ct", "ultrasound"],
    },
    scanDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
savedReportSchema.index({ userId: 1, status: 1 });
savedReportSchema.index({ scanDate: -1 });

const SavedReport = mongoose.model('SavedReport', savedReportSchema);

module.exports = SavedReport; 