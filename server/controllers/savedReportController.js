const SavedReport = require('../models/SavedReport');

// Get all saved reports for a user
const getSavedReports = async (req, res) => {
  try {
    const reports = await SavedReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching saved reports' });
  }
};

// Save a new report
const saveReport = async (req, res) => {
  try {
    const { name, urgentConcerns } = req.body;
    const report = new SavedReport({
      userId: req.user._id,
      name: name || 'Report',
      urgentConcerns
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error saving report' });
  }
};

// Get a single saved report
const getSavedReport = async (req, res) => {
  try {
    const report = await SavedReport.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching report' });
  }
};

// Update a saved report
const updateSavedReport = async (req, res) => {
  try {
    const { name } = req.body;
    const report = await SavedReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name },
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error updating report' });
  }
};

// Delete a saved report
const deleteSavedReport = async (req, res) => {
  try {
    const report = await SavedReport.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report' });
  }
};

module.exports = {
  getSavedReports,
  saveReport,
  getSavedReport,
  updateSavedReport,
  deleteSavedReport
}; 