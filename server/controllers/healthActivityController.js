const HealthActivity = require('../models/HealthActivity');

// Get all health activities for a user
exports.getHealthActivities = async (req, res) => {
  try {
    const activities = await HealthActivity.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health activities' });
  }
};

// Create a new health activity
exports.createHealthActivity = async (req, res) => {
  try {
    const { type, title, date, description, location, provider, attachments, notes } = req.body;
    const activity = new HealthActivity({
      userId: req.user._id,
      type,
      title,
      date,
      description,
      location,
      provider,
      attachments,
      notes
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating health activity' });
  }
};

// Get a single health activity
exports.getHealthActivity = async (req, res) => {
  try {
    const activity = await HealthActivity.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!activity) {
      return res.status(404).json({ message: 'Health activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health activity' });
  }
};

// Update a health activity
exports.updateHealthActivity = async (req, res) => {
  try {
    const { type, title, date, description, location, provider, attachments, notes } = req.body;
    const activity = await HealthActivity.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { type, title, date, description, location, provider, attachments, notes },
      { new: true }
    );
    if (!activity) {
      return res.status(404).json({ message: 'Health activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error updating health activity' });
  }
};

// Delete a health activity
exports.deleteHealthActivity = async (req, res) => {
  try {
    const activity = await HealthActivity.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!activity) {
      return res.status(404).json({ message: 'Health activity not found' });
    }
    res.json({ message: 'Health activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting health activity' });
  }
};

// Get recent activities (last 30 days)
exports.getRecentActivities = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activities = await HealthActivity.find({
      userId: req.user._id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent activities' });
  }
}; 