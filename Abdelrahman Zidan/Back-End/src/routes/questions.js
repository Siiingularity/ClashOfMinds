const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  questionValidation,
  getAllQuestions,
  getQuestionsByCategory,
  getQuestion,
  createQuestion,
  createMultipleQuestions,
  updateQuestion,
  deleteQuestion,
  toggleQuestion,
  getRandomQuestions,
  getQuestionStats
} = require('../controllers/questionController');

// Public routes
router.get('/', getAllQuestions);
router.get('/stats', authenticate, requireAdmin, getQuestionStats);
router.get('/category/:categoryId', getQuestionsByCategory);
router.get('/:id', getQuestion);

// Protected routes
router.post('/random', authenticate, getRandomQuestions);

// Protected admin routes
router.post('/', authenticate, requireAdmin, questionValidation, createQuestion);
router.post('/bulk', authenticate, requireAdmin, createMultipleQuestions);
router.put('/:id', authenticate, requireAdmin, updateQuestion);
router.delete('/:id', authenticate, requireAdmin, deleteQuestion);
router.patch('/:id/toggle', authenticate, requireAdmin, toggleQuestion);

module.exports = router;
