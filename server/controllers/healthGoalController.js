const HealthGoal = require('../models/HealthGoal');

// Get all health goals for a user
exports.getHealthGoals = async (req, res) => {
  try {
    const goals = await HealthGoal.find({ userId: req.user._id })
      .sort({ startDate: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health goals' });
  }
};

// Create a new health goal
exports.createHealthGoal = async (req, res) => {
  try {
    const { title, target, unit, targetDate, notes } = req.body;
    const goal = new HealthGoal({
      userId: req.user._id,
      title,
      target,
      unit,
      targetDate,
      notes
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating health goal' });
  }
};

// Get a single health goal
exports.getHealthGoal = async (req, res) => {
  try {
    const goal = await HealthGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health goal' });
  }
};

// Update a health goal
exports.updateHealthGoal = async (req, res) => {
  try {
    const { title, target, currentProgress, unit, targetDate, status, notes } = req.body;
    const goal = await HealthGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, target, currentProgress, unit, targetDate, status, notes },
      { new: true }
    );
    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating health goal' });
  }
};

// Delete a health goal
exports.deleteHealthGoal = async (req, res) => {
  try {
    const goal = await HealthGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }
    res.json({ message: 'Health goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting health goal' });
  }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
  try {
    const { currentProgress } = req.body;
    const goal = await HealthGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Health goal not found' });
    }

    goal.currentProgress = currentProgress;
    
    // Update status based on progress
    if (currentProgress >= goal.target) {
      goal.status = 'completed';
    }
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal progress' });
  }
}; 