const SavedReport = require('../models/SavedReport');

// Get all saved reports for a user
exports.getSavedReports = async (req, res) => {
  try {
    const reports = await SavedReport.find({ userId: req.user._id })
      .sort({ scanDate: -1 })
      .limit(10);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching saved reports:", error);
    res.status(500).json({ message: 'Error fetching saved reports' });
  }
};

// Save a new report
exports.saveReport = async (req, res) => {
  try {
    console.log('Received save report request:', {
      body: req.body,
      user: req.user._id,
      headers: req.headers
    });

    const { name, scanData, scanType, scanDate, notes } = req.body;
    
    // Validate required fields
    if (!name || !scanData || !scanType) {
      console.log('Missing required fields:', { name, hasScanData: !!scanData, scanType });
      return res.status(400).json({ 
        message: 'Name, scan data, and scan type are required',
        received: { name, hasScanData: !!scanData, scanType }
      });
    }

    // Validate scanType
    if (!['xray', 'mri', 'ct', 'ultrasound'].includes(scanType)) {
      console.log('Invalid scan type:', scanType);
      return res.status(400).json({
        message: 'Invalid scan type. Must be one of: xray, mri, ct, ultrasound',
        received: scanType
      });
    }

    // Validate scanData structure
    if (!scanData.text || !scanData.analysis) {
      console.log('Invalid scanData structure:', scanData);
      return res.status(400).json({
        message: 'Invalid scan data structure. Must include text and analysis fields',
        received: scanData
      });
    }

    // Create new report with validated data
    const report = new SavedReport({
      userId: req.user._id,
      name: name.trim(),
      scanData: {
        text: scanData.text,
        analysis: {
          keyFindings: Array.isArray(scanData.analysis.keyFindings) ? scanData.analysis.keyFindings : [],
          recommendations: Array.isArray(scanData.analysis.recommendations) ? scanData.analysis.recommendations : [],
          urgentConcerns: Array.isArray(scanData.analysis.urgentConcerns) ? scanData.analysis.urgentConcerns : [],
          simplifiedExplanation: scanData.analysis.simplifiedExplanation || ''
        }
      },
      scanType: scanType,
      scanDate: scanDate ? new Date(scanDate) : new Date(),
      notes: notes || '',
      status: 'active'
    });

    console.log('Attempting to save report:', report);

    // Save the report
    const savedReport = await report.save();
    console.log('Report saved successfully:', {
      reportId: savedReport._id,
      name: savedReport.name,
      userId: savedReport.userId
    });
    
    res.status(201).json(savedReport);
  } catch (error) {
    console.error("Error saving report:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
      validationErrors: error.errors // Log Mongoose validation errors if any
    });
    
    // Send more detailed error information
    res.status(500).json({ 
      message: 'Error saving report',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get a single report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await SavedReport.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

// Update a report
exports.updateReport = async (req, res) => {
  try {
    const report = await SavedReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: 'Error updating report' });
  }
};

// Delete a report
exports.deleteReport = async (req, res) => {
  try {
    const report = await SavedReport.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: 'Error deleting report' });
  }
}; 