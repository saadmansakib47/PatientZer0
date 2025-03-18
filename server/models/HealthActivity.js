const mongoose = require("mongoose");

const healthActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        "doctorVisit",
        "lab",
        "medication",
        "treatment",
        "exercise",
        "vaccination",
        "other",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
    },
    provider: {
      type: String,
    },
    attachments: [
      {
        name: String,
        path: String,
        type: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: {
      type: String,
    },
    followUpNeeded: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Create indexes for efficient querying
healthActivitySchema.index({ user: 1, date: -1 });
healthActivitySchema.index({ user: 1, activityType: 1 });

const HealthActivity = mongoose.model("HealthActivity", healthActivitySchema);

module.exports = HealthActivity;
