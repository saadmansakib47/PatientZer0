const express = require("express");
const router = express.Router();
const HealthMetric = require("../models/HealthMetric");
const HealthGoal = require("../models/HealthGoal");
const HealthActivity = require("../models/HealthActivity");
const { authenticateJWT } = require("../middleware/auth");

// All routes require authentication
router.use(authenticateJWT);

// ------------------------
// Health Metrics Routes
// ------------------------

// Get all health metrics for the logged-in user
router.get("/metrics", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      type,
      startDate,
      endDate,
      limit = 50,
      sortBy = "date",
      order = "desc",
    } = req.query;

    const query = { user: userId };

    // Apply filters if provided
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortDirection = order === "desc" ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };

    const metrics = await HealthMetric.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit));

    res.status(200).json(metrics);
  } catch (error) {
    console.error("Error fetching health metrics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get latest metrics for each type
router.get("/metrics/latest", async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unique metric types for the user
    const types = await HealthMetric.distinct("type", { user: userId });

    // Get latest metric for each type
    const latestMetrics = await Promise.all(
      types.map(async (type) => {
        const latest = await HealthMetric.findOne({ user: userId, type }).sort({
          date: -1,
        });
        return latest;
      })
    );

    res.status(200).json(latestMetrics.filter(Boolean));
  } catch (error) {
    console.error("Error fetching latest metrics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific health metric
router.get("/metrics/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const metricId = req.params.id;

    const metric = await HealthMetric.findOne({ _id: metricId, user: userId });

    if (!metric) {
      return res.status(404).json({ message: "Metric not found" });
    }

    res.status(200).json(metric);
  } catch (error) {
    console.error("Error fetching health metric:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new health metric
router.post("/metrics", async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, name, value, unit, date, notes, tags } = req.body;

    const newMetric = new HealthMetric({
      user: userId,
      type,
      name,
      value,
      unit,
      date: date ? new Date(date) : new Date(),
      notes,
      tags,
    });

    await newMetric.save();

    res.status(201).json(newMetric);
  } catch (error) {
    console.error("Error creating health metric:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a health metric
router.put("/metrics/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const metricId = req.params.id;
    const updates = req.body;

    // Prevent changing the user
    delete updates.user;

    const metric = await HealthMetric.findOneAndUpdate(
      { _id: metricId, user: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!metric) {
      return res.status(404).json({ message: "Metric not found" });
    }

    res.status(200).json(metric);
  } catch (error) {
    console.error("Error updating health metric:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a health metric
router.delete("/metrics/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const metricId = req.params.id;

    const metric = await HealthMetric.findOneAndDelete({
      _id: metricId,
      user: userId,
    });

    if (!metric) {
      return res.status(404).json({ message: "Metric not found" });
    }

    res.status(200).json({ message: "Metric deleted successfully" });
  } catch (error) {
    console.error("Error deleting health metric:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// Health Goals Routes
// ------------------------

// Get all health goals for the logged-in user
router.get("/goals", async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, completed, active } = req.query;

    const query = { user: userId };

    // Apply filters if provided
    if (type) query.type = type;
    if (completed !== undefined) query.completed = completed === "true";

    // For active goals, check if the end date is in the future or not set
    if (active === "true") {
      query.$or = [{ endDate: { $gt: new Date() } }, { endDate: null }];
    }

    const goals = await HealthGoal.find(query).sort({ createdAt: -1 });

    res.status(200).json(goals);
  } catch (error) {
    console.error("Error fetching health goals:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific health goal
router.get("/goals/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const goalId = req.params.id;

    const goal = await HealthGoal.findOne({ _id: goalId, user: userId });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error("Error fetching health goal:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new health goal
router.post("/goals", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      type,
      target,
      unit,
      currentProgress,
      startDate,
      endDate,
      frequency,
      notes,
      reminderEnabled,
      reminderTime,
    } = req.body;

    const newGoal = new HealthGoal({
      user: userId,
      title,
      type,
      target,
      unit,
      currentProgress: currentProgress || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      frequency,
      notes,
      reminderEnabled,
      reminderTime,
    });

    await newGoal.save();

    res.status(201).json(newGoal);
  } catch (error) {
    console.error("Error creating health goal:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a health goal
router.put("/goals/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const goalId = req.params.id;
    const updates = req.body;

    // Prevent changing the user
    delete updates.user;

    // Convert dates if provided
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);

    const goal = await HealthGoal.findOneAndUpdate(
      { _id: goalId, user: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error("Error updating health goal:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a health goal
router.delete("/goals/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const goalId = req.params.id;

    const goal = await HealthGoal.findOneAndDelete({
      _id: goalId,
      user: userId,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting health goal:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update goal progress
router.patch("/goals/:id/progress", async (req, res) => {
  try {
    const userId = req.user._id;
    const goalId = req.params.id;
    const { currentProgress } = req.body;

    if (currentProgress === undefined) {
      return res.status(400).json({ message: "Current progress is required" });
    }

    const goal = await HealthGoal.findOne({ _id: goalId, user: userId });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.currentProgress = currentProgress;

    // Auto-mark as completed if target is reached
    if (currentProgress >= goal.target && !goal.completed) {
      goal.completed = true;
    }

    await goal.save();

    res.status(200).json(goal);
  } catch (error) {
    console.error("Error updating goal progress:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// Health Activities Routes
// ------------------------

// Get all health activities for the logged-in user
router.get("/activities", async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, startDate, endDate, limit = 50 } = req.query;

    const query = { user: userId };

    // Apply filters if provided
    if (type) query.activityType = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const activities = await HealthActivity.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching health activities:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific health activity
router.get("/activities/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const activityId = req.params.id;

    const activity = await HealthActivity.findOne({
      _id: activityId,
      user: userId,
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error fetching health activity:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new health activity
router.post("/activities", async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      activityType,
      title,
      description,
      date,
      location,
      provider,
      notes,
      followUpNeeded,
      followUpDate,
      reminderEnabled,
      reminderDate,
    } = req.body;

    const newActivity = new HealthActivity({
      user: userId,
      activityType,
      title,
      description,
      date: new Date(date),
      location,
      provider,
      notes,
      followUpNeeded,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      reminderEnabled,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
    });

    await newActivity.save();

    res.status(201).json(newActivity);
  } catch (error) {
    console.error("Error creating health activity:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a health activity
router.put("/activities/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const activityId = req.params.id;
    const updates = req.body;

    // Prevent changing the user
    delete updates.user;

    // Convert dates if provided
    if (updates.date) updates.date = new Date(updates.date);
    if (updates.followUpDate)
      updates.followUpDate = new Date(updates.followUpDate);
    if (updates.reminderDate)
      updates.reminderDate = new Date(updates.reminderDate);

    const activity = await HealthActivity.findOneAndUpdate(
      { _id: activityId, user: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error updating health activity:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a health activity
router.delete("/activities/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const activityId = req.params.id;

    const activity = await HealthActivity.findOneAndDelete({
      _id: activityId,
      user: userId,
    });

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting health activity:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
