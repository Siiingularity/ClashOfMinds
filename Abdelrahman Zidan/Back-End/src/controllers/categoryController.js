const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// Validation rules
const categoryValidation = [
  body('nameAr').trim().notEmpty().withMessage('Arabic name is required'),
  body('nameEn').trim().notEmpty().withMessage('English name is required'),
  body('section').trim().notEmpty().withMessage('Section is required')
];

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
  const { section, search } = req.query;
  
  const categories = await Category.getAll({
    section,
    search,
    isActive: true
  });

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// Get categories grouped by sections
const getCategoriesBySection = asyncHandler(async (req, res) => {
  const grouped = await Category.getAllWithSections();

  res.json({
    success: true,
    data: grouped
  });
});

// Get single category
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: category
  });
});

// Create new category (admin only)
const createCategory = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { nameAr, nameEn, descriptionAr, descriptionEn, section, imageUrl, questionCount } = req.body;

  const categoryId = await Category.create({
    nameAr,
    nameEn,
    descriptionAr,
    descriptionEn,
    section,
    imageUrl,
    questionCount
  });

  const category = await Category.findById(categoryId);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

// Update category (admin only)
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nameAr, nameEn, descriptionAr, descriptionEn, section, imageUrl, isActive, questionCount } = req.body;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const updates = {};
  if (nameAr !== undefined) updates.nameAr = nameAr;
  if (nameEn !== undefined) updates.nameEn = nameEn;
  if (descriptionAr !== undefined) updates.descriptionAr = descriptionAr;
  if (descriptionEn !== undefined) updates.descriptionEn = descriptionEn;
  if (section !== undefined) updates.section = section;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (isActive !== undefined) updates.isActive = isActive;
  if (questionCount !== undefined) updates.questionCount = questionCount;

  await Category.update(id, updates);
  
  const updatedCategory = await Category.findById(id);

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory
  });
});

// Delete category (admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  await Category.delete(id);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// Toggle category active status (admin only)
const toggleCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  await Category.toggleActive(id);
  
  const updatedCategory = await Category.findById(id);

  res.json({
    success: true,
    message: 'Category status toggled successfully',
    data: updatedCategory
  });
});

// Get random categories for game
const getRandomCategories = asyncHandler(async (req, res) => {
  const { count = 6 } = req.query;
  
  const categories = await Category.getRandomForGame(parseInt(count));

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// Get category statistics (admin only)
const getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await Category.getStats();

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
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
};
