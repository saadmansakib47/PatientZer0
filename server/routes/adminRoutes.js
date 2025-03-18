const express = require("express");
const router = express.Router();
const User = require("../models/User");
const adminAuth = require("../middleware/adminAuth");
const mongoose = require("mongoose");

// Get doctors by status (pending, approved, rejected)
router.get("/doctors", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { role: "doctor" };

    console.log("Admin API - Fetching doctors with status:", status || "all");

    if (status === "pending") {
      query["additionalInfo.verificationStatus"] = "pending";
    } else if (status === "approved") {
      query["additionalInfo.verificationStatus"] = "approved";
    } else if (status === "rejected") {
      query["additionalInfo.verificationStatus"] = "rejected";
    }

    console.log("Admin API - Query:", JSON.stringify(query));

    const doctors = await User.find(query).select("-password");

    console.log(`Admin API - Found ${doctors.length} doctors`);

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve a doctor
router.post("/doctors/:id/approve", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    console.log(`Admin approving doctor with ID: ${id}`);

    // First find the user to check if they exist and are a doctor
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (user.role !== "doctor") {
      return res.status(400).json({ message: "User is not a doctor" });
    }

    console.log(
      `Found doctor: ${user.email}, current isActive: ${user.isActive}, verificationStatus: ${user.additionalInfo?.verificationStatus}`
    );

    // Prepare the verification comment
    const verificationComment = {
      status: "approved",
      text: comment || "Application approved",
      date: new Date(),
      adminId: req.user._id,
      adminName: req.user.name,
    };

    // Use direct MongoDB update to avoid Mongoose middleware issues
    const updateResult = await mongoose.connection
      .collection("users")
      .updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        {
          $set: {
            isActive: true,
            "additionalInfo.verificationStatus": "approved",
            "additionalInfo.isDoctorVerified": true,
          },
          $push: {
            "additionalInfo.verificationComments": verificationComment,
          },
        }
      );

    console.log(`Database update result:`, updateResult);

    if (updateResult.modifiedCount === 0) {
      console.error("Failed to update doctor status in database");
      return res
        .status(500)
        .json({ message: "Failed to update doctor status" });
    }

    console.log(`Doctor ${user.email} approved successfully`);
    res.status(200).json({ message: "Doctor approved successfully" });
  } catch (error) {
    console.error("Error approving doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a doctor
router.post("/doctors/:id/reject", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res
        .status(400)
        .json({ message: "Comment is required for rejection" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (user.role !== "doctor") {
      return res.status(400).json({ message: "User is not a doctor" });
    }

    // Update doctor status
    user.isActive = false;
    user.additionalInfo.verificationStatus = "rejected";
    user.additionalInfo.isDoctorVerified = false;

    // Add verification comment
    if (!user.additionalInfo.verificationComments) {
      user.additionalInfo.verificationComments = [];
    }

    user.additionalInfo.verificationComments.push({
      status: "rejected",
      text: comment,
      date: new Date(),
      adminId: req.user._id,
      adminName: req.user.name,
    });

    await user.save();

    res.status(200).json({ message: "Doctor application rejected" });
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users with pagination
router.get("/users", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;

    console.log("Admin API - Fetching users with params:", {
      page,
      limit,
      role: role || "all",
    });

    let query = {};
    if (role && role !== "all") {
      query.role = role;
    }

    console.log("Admin API - Query:", JSON.stringify(query));

    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(
      `Admin API - Found ${users.length} users, total: ${totalUsers}`
    );

    res.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user status (suspend/activate)
router.put("/users/:userId/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isActive = status === "active";
    await user.save();

    res.status(200).json({ message: `User status updated to ${status}` });
  } catch (error) {
    console.error("Error updating user status:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating user status" });
  }
});

// Update a user
router.put("/users/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a user
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if trying to delete the only admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the only admin user",
        });
      }
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
