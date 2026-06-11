const Section = require('../models/Section');
const { asyncHandler } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// ── Validation ───────────────────────────────────────────────────────────────
const sectionValidation = [
  body('nameAr').trim().notEmpty().withMessage('Arabic name is required'),
  body('nameEn').trim().notEmpty().withMessage('English name is required'),
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9\u0600-\u06FF_-]+$/)
    .withMessage('Slug can only contain letters, numbers, hyphens and underscores'),
];

// ── GET /api/sections ─────────────────────────────────────────────────────────
const getAllSections = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const sections = await Section.getAll({ includeInactive });

  res.json({
    success: true,
    count: sections.length,
    data: sections,
  });
});

// ── GET /api/sections/:id ─────────────────────────────────────────────────────
const getSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);

  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  res.json({ success: true, data: section });
});

// ── POST /api/sections ────────────────────────────────────────────────────────
const createSection = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  const { nameAr, nameEn, slug, displayOrder } = req.body;

  // Unique slug check
  const slugTaken = await Section.slugExists(slug);
  if (slugTaken) {
    return res.status(409).json({ success: false, message: 'Slug already exists, choose another' });
  }

  const id = await Section.create({ nameAr, nameEn, slug, displayOrder });
  const section = await Section.findById(id);

  res.status(201).json({
    success: true,
    message: 'Section created successfully',
    data: section,
  });
});

// ── PUT /api/sections/:id ─────────────────────────────────────────────────────
const updateSection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nameAr, nameEn, slug: newSlug, displayOrder, isActive } = req.body;

  const section = await Section.findById(id);
  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  // If slug is changing, check uniqueness
  if (newSlug && newSlug !== section.slug) {
    const slugTaken = await Section.slugExists(newSlug, id);
    if (slugTaken) {
      return res.status(409).json({ success: false, message: 'Slug already exists, choose another' });
    }
  }

  await Section.update(id, { nameAr, nameEn, newSlug, displayOrder, isActive });

  const updated = await Section.findById(id);

  res.json({
    success: true,
    message: 'Section updated successfully',
    data: updated,
  });
});

// ── DELETE /api/sections/:id ──────────────────────────────────────────────────
// Normal delete — blocks if section has categories
// Pass ?force=true&reassignTo=<slug> to force-delete and reassign categories
const deleteSection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { force, reassignTo } = req.query;

  const section = await Section.findById(id);
  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  if (force === 'true') {
    await Section.forceDelete(id, reassignTo || null);
    return res.json({
      success: true,
      message: reassignTo
        ? `Section deleted and categories reassigned to "${reassignTo}"`
        : 'Section deleted and orphaned categories deactivated',
    });
  }

  const result = await Section.delete(id);

  if (!result.deleted) {
    if (result.reason === 'has_categories') {
      return res.status(409).json({
        success: false,
        message: `Cannot delete: ${result.count} category(ies) still use this section. Use ?force=true to force delete.`,
        count: result.count,
      });
    }
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  res.json({ success: true, message: 'Section deleted successfully' });
});

// ── PATCH /api/sections/:id/toggle ───────────────────────────────────────────
const toggleSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  await Section.toggleActive(req.params.id);
  const updated = await Section.findById(req.params.id);

  res.json({
    success: true,
    message: 'Section status toggled',
    data: updated,
  });
});

module.exports = {
  sectionValidation,
  getAllSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  toggleSection,
};
