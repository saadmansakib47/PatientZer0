const mongoose = require("mongoose");

const healthMetricSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "heartRate",
        "bloodPressure",
        "bloodSugar",
        "oxygenLevel",
        "cholesterol",
        "weight",
        "steps",
        "sleep",
        "caloriesBurned",
        "water",
        "custom",
      ],
    },
    name: {
      type: String,
      required: function () {
        return this.type === "custom";
      },
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Create an index for efficient querying by user and date
healthMetricSchema.index({ user: 1, date: -1 });

const HealthMetric = mongoose.model("HealthMetric", healthMetricSchema);

module.exports = HealthMetric;
