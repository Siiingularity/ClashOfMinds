const SiteSettings = require('../models/SiteSettings');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/site-settings — public
const getAll = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getAll();
  res.json({ success: true, data: settings });
});

// GET /api/site-settings/:key — public
const getOne = asyncHandler(async (req, res) => {
  const setting = await SiteSettings.get(req.params.key);
  if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
  res.json({ success: true, data: setting });
});

// POST /api/site-settings — admin only { key, value }
const setSetting = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ success: false, message: 'key and value are required' });
  }
  const result = await SiteSettings.set(key, value);
  res.json({ success: true, data: result });
});

// DELETE /api/site-settings/:key — admin only
const deleteSetting = asyncHandler(async (req, res) => {
  await SiteSettings.delete(req.params.key);
  res.json({ success: true, message: 'Setting deleted' });
});

module.exports = { getAll, getOne, setSetting, deleteSetting };
