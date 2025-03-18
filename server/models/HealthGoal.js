const mongoose = require("mongoose");

const healthGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "steps",
        "caloriesBurned",
        "sleep",
        "weight",
        "water",
        "exercise",
        "nutrition",
        "custom",
      ],
    },
    target: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    currentProgress: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "once"],
      default: "daily",
    },
    notes: {
      type: String,
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderTime: {
      type: String,
    },
  },
  { timestamps: true }
);

// Create indexes for efficient querying
healthGoalSchema.index({ user: 1, completed: 1 });
healthGoalSchema.index({ user: 1, type: 1 });

const HealthGoal = mongoose.model("HealthGoal", healthGoalSchema);

module.exports = HealthGoal;
