/**
 * Script to create or promote a user to admin
 *
 * Usage:
 * 1. Make sure MongoDB is running
 * 2. Run with: node createAdmin.js your@email.com
 */

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error(
    "Please provide an email address: node createAdmin.js your@email.com"
  );
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function createOrPromoteAdmin() {
  try {
    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update existing user to admin
      existingUser.role = "admin";
      await existingUser.save();
      console.log(`User ${email} has been promoted to admin`);
    } else {
      // Create a new admin user
      const password = "admin123"; // Temporary password, should be changed
      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = new User({
        name: "Admin User",
        email,
        password: hashedPassword,
        role: "admin",
      });

      await newAdmin.save();
      console.log(`New admin created with email: ${email}`);
      console.log(
        "Default password: admin123 (please change after first login)"
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createOrPromoteAdmin();
