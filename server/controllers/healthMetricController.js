const HealthMetric = require('../models/HealthMetric');

// Get all health metrics for a user
exports.getHealthMetrics = async (req, res) => {
  try {
    const metrics = await HealthMetric.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health metrics' });
  }
};

// Create a new health metric
exports.createHealthMetric = async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    const metric = new HealthMetric({
      userId: req.user._id,
      type,
      value,
      unit,
      notes
    });
    await metric.save();
    res.status(201).json(metric);
  } catch (error) {
    res.status(500).json({ message: 'Error creating health metric' });
  }
};

// Get a single health metric
exports.getHealthMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!metric) {
      return res.status(404).json({ message: 'Health metric not found' });
    }
    res.json(metric);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health metric' });
  }
};

// Update a health metric
exports.updateHealthMetric = async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    const metric = await HealthMetric.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { type, value, unit, notes },
      { new: true }
    );
    if (!metric) {
      return res.status(404).json({ message: 'Health metric not found' });
    }
    res.json(metric);
  } catch (error) {
    res.status(500).json({ message: 'Error updating health metric' });
  }
};

// Delete a health metric
exports.deleteHealthMetric = async (req, res) => {
  try {
    const metric = await HealthMetric.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!metric) {
      return res.status(404).json({ message: 'Health metric not found' });
    }
    res.json({ message: 'Health metric deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting health metric' });
  }
}; 