const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    reportType: {
      type: String,
      enum: [
        "bloodTest",
        "urineTest",
        "imaging",
        "cardiology",
        "pathology",
        "other",
      ],
      default: "other",
    },
    doctorName: {
      type: String,
    },
    facility: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    concerns: [
      {
        description: {
          type: String,
          required: true,
        },
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        resolved: {
          type: Boolean,
          default: false,
        },
        followUpDate: Date,
        notes: String,
      },
    ],
    analysis: {
      summary: String,
      abnormalValues: [
        {
          name: String,
          value: String,
          normalRange: String,
          severity: String,
        },
      ],
      recommendations: [String],
    },
    tags: [String],
    isSharedWithDoctor: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        doctor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        sharedDate: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

// Create indexes for efficient querying
reportSchema.index({ user: 1, reportDate: -1 });
reportSchema.index({ user: 1, reportType: 1 });
reportSchema.index({ user: 1, tags: 1 });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
