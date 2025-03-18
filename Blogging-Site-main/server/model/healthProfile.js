import mongoose from "mongoose";

const healthProfileSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  conditions: [
    {
      type: String,
      required: true,
    },
  ],
  goals: [
    {
      type: String,
      default: [],
    },
  ],
  currentStatus: {
    type: String,
    default: "",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  history: [
    {
      condition: String,
      status: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const HealthProfile = mongoose.model("healthProfile", healthProfileSchema);

export default HealthProfile;
