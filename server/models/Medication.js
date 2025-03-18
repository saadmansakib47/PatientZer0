const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    instructions: {
      type: String,
    },
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
    },
    sideEffects: [String],
    intakeHistory: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        taken: {
          type: Boolean,
          default: false,
        },
        notes: String,
      },
    ],
    reminders: {
      enabled: {
        type: Boolean,
        default: false,
      },
      times: [String],
    },
    adherenceRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Calculate adherence rate before saving
medicationSchema.pre("save", function (next) {
  if (this.intakeHistory && this.intakeHistory.length > 0) {
    const totalIntakes = this.intakeHistory.length;
    const takenIntakes = this.intakeHistory.filter(
      (intake) => intake.taken
    ).length;
    this.adherenceRate = Math.round((takenIntakes / totalIntakes) * 100);
  }
  next();
});

// Create indexes for efficient querying
medicationSchema.index({ user: 1, startDate: -1 });
medicationSchema.index({ user: 1, name: 1 });

const Medication = mongoose.model("Medication", medicationSchema);

module.exports = Medication;
