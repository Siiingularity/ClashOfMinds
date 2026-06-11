const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  sectionValidation,
  getAllSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  toggleSection,
} = require('../controllers/sectionController');

// Public — frontend needs section list to render the categories page
router.get('/', getAllSections);
router.get('/:id', getSection);

// Admin only
router.post('/', authenticate, requireAdmin, sectionValidation, createSection);
router.put('/:id', authenticate, requireAdmin, updateSection);
router.delete('/:id', authenticate, requireAdmin, deleteSection);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleSection);

module.exports = router;
