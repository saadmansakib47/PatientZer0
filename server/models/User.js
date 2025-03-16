const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String },
  role: { type: String, required: true, enum: ["patient", "doctor"] },
  profilePhoto: { type: String },
  additionalInfo: {
    age: Number,
    gender: String,
    country: String,
    state: String,
    hospitalName: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },
    certificationId: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "doctor";
      },
    },
    qualification: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
