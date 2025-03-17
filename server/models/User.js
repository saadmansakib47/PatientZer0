const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String },
  role: { type: String, enum: ["patient", "doctor"], default: "patient" },
  profilePhoto: { type: String },
  additionalInfo: {
    age: Number,
    gender: String,
    country: String,
    state: String,
    // Doctor specific fields
    isDoctorVerified: { type: Boolean, default: false },
    hospitalName: String,
    certificationId: { type: String, unique: true, sparse: true },
    qualification: String,
    degreeProof: String, // URL to uploaded degree proof
    verificationStatus: { 
      type: String, 
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
