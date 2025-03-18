const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 30,
    },
    type: {
      type: String,
      enum: ["consultation", "followUp", "checkup", "emergency", "other"],
      default: "consultation",
    },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    location: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    reminders: {
      enabled: {
        type: Boolean,
        default: true,
      },
      times: [
        {
          type: Number, // minutes before appointment
          default: [60, 1440], // 1 hour and 24 hours before
        },
      ],
    },
    payment: {
      amount: {
        type: Number,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "refunded"],
        default: "pending",
      },
      method: String,
      transactionId: String,
    },
    followUp: {
      required: {
        type: Boolean,
        default: false,
      },
      recommendedDate: Date,
      notes: String,
    },
  },
  { timestamps: true }
);

// Create indexes for efficient querying
appointmentSchema.index({ user: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
