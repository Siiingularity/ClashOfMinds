const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  categoryValidation,
  getAllCategories,
  getCategoriesBySection,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
  getRandomCategories,
  getCategoryStats
} = require('../controllers/categoryController');

// Public routes
router.get('/', getAllCategories);
router.get('/by-section', getCategoriesBySection);
router.get('/random', getRandomCategories);
router.get('/stats', authenticate, requireAdmin, getCategoryStats);
router.get('/:id', getCategory);

// Protected admin routes
router.post('/', authenticate, requireAdmin, categoryValidation, createCategory);
router.put('/:id', authenticate, requireAdmin, updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleCategory);

module.exports = router;
