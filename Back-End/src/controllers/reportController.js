const Report = require('../models/Report');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/reports — submit a report (public, no auth required)
const createReport = asyncHandler(async (req, res) => {
  const { description, questionId, categoryId, username, email } = req.body;

  if (!description || !String(description).trim()) {
    return res.status(400).json({ success: false, message: 'Description is required' });
  }

  const userId = req.user?.id || null;

  const id = await Report.create({
    userId,
    questionId: questionId || null,
    categoryId: categoryId || null,
    description: String(description).trim(),
    username: username || req.user?.username || null,
    email: email || req.user?.email || null
  });

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully',
    data: { id }
  });
});

// GET /api/reports — admin only
const getAllReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const reports = await Report.getAll({ status });
  res.json({ success: true, count: reports.length, data: reports });
});

// PATCH /api/reports/:id/status — admin only
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'reviewed', 'resolved'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `status must be one of: ${allowed.join(', ')}` });
  }
  await Report.updateStatus(req.params.id, status);
  res.json({ success: true, message: 'Status updated' });
});

module.exports = { createReport, getAllReports, updateStatus };
