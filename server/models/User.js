const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      validate: {
        validator: function (v) {
          // No validation if password is not provided (Google auth)
          if (!v) return true;
          // Validate if password is provided
          return v.length >= 6;
        },
        message: "Password must be at least 6 characters",
      },
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profilePicture: {
      type: String,
    },
    additionalInfo: {
      // Common fields
      age: Number,
      gender: String,
      dateOfBirth: Date,
      phoneNumber: String,
      address: String,
      country: String,
      state: String,

      // Patient specific fields
      medicalHistory: [
        {
          condition: String,
          diagnosedDate: Date,
          medications: [String],
          notes: String,
        },
      ],
      allergies: [String],
      emergencyContact: {
        name: String,
        relationship: String,
        phoneNumber: String,
      },

      // Doctor specific fields
      specialization: String,
      qualifications: [
        {
          degree: String,
          institution: String,
          year: Number,
        },
      ],
      experience: [
        {
          position: String,
          hospital: String,
          years: Number,
        },
      ],
      bmdcNumber: String,
      consultationFee: Number,
      hospitalName: String,
      chamberAddress: String,
      availableTimeSlots: [
        {
          day: String,
          startTime: String,
          endTime: String,
        },
      ],
      bio: String,
      bmdcCertificate: String,
      degreeCertificate: String,
      doctorImage: String,
      verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      isDoctorVerified: {
        type: Boolean,
        default: false,
      },
      verificationComments: [
        {
          status: String,
          text: String,
          date: {
            type: Date,
            default: Date.now,
          },
          adminId: mongoose.Schema.Types.ObjectId,
          adminName: String,
        },
      ],
    },
  },
  { timestamps: true }
);

// Pre-save middleware to hash password
UserSchema.pre("save", async function (next) {
  const user = this;

  try {
    // Skip password hashing if specifically flagged (for admin approvals)
    if (user.$locals && user.$locals.skipPasswordHashing) {
      console.log(`Skipping password hashing for user: ${user.email}`);
      return next();
    }

    // Only hash the password if it's modified or new AND doesn't start with $2b$ (bcrypt format)
    // This prevents double-hashing of already hashed passwords
    if (!user.isModified("password") || !user.password) return next();

    // Check if password is already hashed (begins with $2b$)
    if (user.password.startsWith("$2b$")) {
      console.log(
        `Password for ${user.email} appears to be already hashed, skipping hashing`
      );
      return next();
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  // If no password set (Google auth), return false
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
