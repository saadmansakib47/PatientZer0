const express = require("express");
const router = express.Router();
const HealthMetric = require("../models/HealthMetric");
const HealthGoal = require("../models/HealthGoal");
const HealthActivity = require("../models/HealthActivity");
const Medication = require("../models/Medication");
const Appointment = require("../models/Appointment");
const Report = require("../models/Report");
const { authenticateJWT } = require("../middleware/auth");

// Mock data for testing
const mockMetrics = [
  {
    _id: "metric1",
    type: "heartRate",
    name: "Heart Rate",
    value: 72,
    unit: "bpm",
    date: new Date(),
  },
  {
    _id: "metric2",
    type: "bloodPressure",
    name: "Blood Pressure",
    value: { systolic: 120, diastolic: 80 },
    unit: "mmHg",
    date: new Date(),
  },
];

const mockGoals = [
  {
    _id: "goal1",
    title: "Increase daily steps",
    type: "activity",
    target: 10000,
    currentProgress: 7500,
    unit: "steps",
  },
  {
    _id: "goal2",
    title: "Reduce blood pressure",
    type: "bloodPressure",
    target: { systolic: 120, diastolic: 80 },
    currentProgress: { systolic: 130, diastolic: 85 },
    unit: "mmHg",
  },
];

const mockAppointments = [
  {
    _id: "appt1",
    doctorName: "Dr. Jane Smith",
    specialty: "Cardiologist",
    date: new Date(Date.now() + 86400000 * 3), // 3 days from now
    time: "10:00 AM",
    location: "Heart Health Clinic",
    reason: "Annual checkup",
  },
  {
    _id: "appt2",
    doctorName: "Dr. John Davis",
    specialty: "General Practitioner",
    date: new Date(Date.now() + 86400000 * 7), // 7 days from now
    time: "2:30 PM",
    location: "City Medical Center",
    reason: "Flu symptoms",
  },
];

const mockMedications = [
  {
    _id: "med1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    startDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
    instructions: "Take with food in the morning",
    intakeHistory: [
      { date: new Date(Date.now() - 86400000), taken: true },
      { date: new Date(Date.now() - 86400000 * 2), taken: true },
      { date: new Date(Date.now() - 86400000 * 3), taken: false },
    ],
    adherenceRate: 67,
  },
  {
    _id: "med2",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    startDate: new Date(Date.now() - 86400000 * 60), // 60 days ago
    instructions: "Take with breakfast and dinner",
    intakeHistory: [
      { date: new Date(Date.now() - 86400000), taken: true },
      { date: new Date(Date.now() - 86400000 * 2), taken: true },
      { date: new Date(Date.now() - 86400000 * 3), taken: true },
    ],
    adherenceRate: 100,
  },
];

const mockReports = [
  {
    _id: "report1",
    title: "Annual Blood Test Results",
    content:
      "All values within normal range except slightly elevated cholesterol.",
    reportDate: new Date(Date.now() - 86400000 * 14), // 14 days ago
    reportType: "bloodTest",
    doctorName: "Dr. Sarah Johnson",
    facility: "City Medical Lab",
    analysis: {
      summary: "Overall good health with minor concerns about cholesterol.",
      abnormalValues: [
        {
          name: "Total Cholesterol",
          value: "210 mg/dL",
          normalRange: "< 200 mg/dL",
          severity: "low",
        },
      ],
      recommendations: ["Consider dietary changes to reduce cholesterol."],
    },
  },
  {
    _id: "report2",
    title: "Chest X-Ray",
    content: "No abnormalities detected in the lungs or chest cavity.",
    reportDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
    reportType: "imaging",
    doctorName: "Dr. Michael Chen",
    facility: "General Hospital Radiology",
    analysis: {
      summary: "Normal chest X-ray with no concerning findings.",
      abnormalValues: [],
      recommendations: ["No follow-up needed at this time."],
    },
  },
];

// All routes require authentication
router.use(authenticateJWT);

// Mock data endpoints for testing
router.get("/metrics/mock", (req, res) => {
  res.status(200).json(mockMetrics);
});

router.get("/goals/mock", (req, res) => {
  res.status(200).json(mockGoals);
});

router.get("/appointments/mock", (req, res) => {
  res.status(200).json(mockAppointments);
});

router.get("/medications/mock", (req, res) => {
  res.status(200).json(mockMedications);
});

router.get("/reports/mock", (req, res) => {
  res.status(200).json(mockReports);
});

// Use mock data for now
router.get("/metrics", (req, res) => {
  res.status(200).json(mockMetrics);
});

router.get("/goals", (req, res) => {
  res.status(200).json(mockGoals);
});

router.get("/appointments", (req, res) => {
  res.status(200).json(mockAppointments);
});

router.get("/medications", (req, res) => {
  res.status(200).json(mockMedications);
});

router.get("/reports", (req, res) => {
  res.status(200).json(mockReports);
});

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

// ------------------------
// Medications Routes
// ------------------------

// Get all medications for the logged-in user
router.get("/medications", async (req, res) => {
  try {
    const userId = req.user._id;
    const medications = await Medication.find({ user: userId }).sort({
      startDate: -1,
    });
    res.status(200).json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new medication
router.post("/medications", async (req, res) => {
  try {
    const userId = req.user._id;
    const medicationData = { ...req.body, user: userId };
    const newMedication = new Medication(medicationData);
    await newMedication.save();
    res.status(201).json(newMedication);
  } catch (error) {
    console.error("Error adding medication:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update medication
router.put("/medications/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const medicationId = req.params.id;
    const updates = req.body;
    delete updates.user;

    const medication = await Medication.findOneAndUpdate(
      { _id: medicationId, user: userId },
      updates,
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.status(200).json(medication);
  } catch (error) {
    console.error("Error updating medication:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete medication
router.delete("/medications/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const medicationId = req.params.id;

    const medication = await Medication.findOneAndDelete({
      _id: medicationId,
      user: userId,
    });

    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    res.status(200).json({ message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Error deleting medication:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Track medication intake
router.post("/medications/:id/track", async (req, res) => {
  try {
    const userId = req.user._id;
    const medicationId = req.params.id;
    const { taken, date = new Date() } = req.body;

    const medication = await Medication.findOne({
      _id: medicationId,
      user: userId,
    });

    if (!medication) {
      return res.status(404).json({ message: "Medication not found" });
    }

    medication.intakeHistory.push({ date, taken });
    await medication.save();

    res.status(200).json(medication);
  } catch (error) {
    console.error("Error tracking medication intake:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// Appointments Routes
// ------------------------

// Get all appointments for the logged-in user
router.get("/appointments", async (req, res) => {
  try {
    const userId = req.user._id;
    const appointments = await Appointment.find({ user: userId })
      .sort({ date: 1 })
      .populate("doctor", "name specialty");
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new appointment
router.post("/appointments", async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentData = { ...req.body, user: userId };
    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update appointment
router.put("/appointments/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;
    const updates = req.body;
    delete updates.user;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, user: userId },
      updates,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete appointment
router.delete("/appointments/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findOneAndDelete({
      _id: appointmentId,
      user: userId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// Health Reports Routes
// ------------------------

// Get all reports for the logged-in user
router.get("/reports", async (req, res) => {
  try {
    const userId = req.user._id;
    const reports = await Report.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a specific report
router.get("/reports/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const reportId = req.params.id;

    const report = await Report.findOne({ _id: reportId, user: userId });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Analyze and save a new report
router.post("/analyze-report", async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, content, reportDate, reportType, doctorName, facility } =
      req.body;

    // Here you would integrate with any analysis service
    // For now, we'll just save the report

    const newReport = new Report({
      user: userId,
      title,
      content,
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      reportType,
      doctorName,
      facility,
      concerns: [],
      analysis: {
        summary: "Report analysis pending",
        abnormalValues: [],
        recommendations: [],
      },
    });

    await newReport.save();

    res.status(201).json(newReport);
  } catch (error) {
    console.error("Error analyzing report:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a report
router.put("/reports/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const reportId = req.params.id;
    const updates = req.body;

    // Prevent changing the user
    delete updates.user;

    // Convert date if provided
    if (updates.reportDate) {
      updates.reportDate = new Date(updates.reportDate);
    }

    const report = await Report.findOneAndUpdate(
      { _id: reportId, user: userId },
      updates,
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a report
router.delete("/reports/:id", async (req, res) => {
  try {
    const userId = req.user._id;
    const reportId = req.params.id;

    const report = await Report.findOneAndDelete({
      _id: reportId,
      user: userId,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
