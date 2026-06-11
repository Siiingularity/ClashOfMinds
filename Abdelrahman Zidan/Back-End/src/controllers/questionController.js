const Question = require('../models/Question');
const { asyncHandler } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// Validation rules
const questionValidation = [
  body('categoryId').isInt().withMessage('Valid category ID is required'),
  body('questionAr').trim().notEmpty().withMessage('Arabic question is required'),
  body('questionEn').trim().notEmpty().withMessage('English question is required'),
  body('answerAr').trim().notEmpty().withMessage('Arabic answer is required'),
  body('answerEn').trim().notEmpty().withMessage('English answer is required'),
  body('points').isIn([200, 400, 600]).withMessage('Points must be 200, 400, or 600'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level')
];

// Get all questions
const getAllQuestions = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    categoryId, 
    difficulty, 
    points, 
    search 
  } = req.query;
  
  const result = await Question.getAll({
    page: parseInt(page),
    limit: parseInt(limit),
    categoryId: categoryId ? parseInt(categoryId) : null,
    difficulty,
    points: points ? parseInt(points) : null,
    search
  });

  res.json({
    success: true,
    data: result
  });
});

// Get questions by category
const getQuestionsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  
  const questions = await Question.getByCategory(categoryId);

  res.json({
    success: true,
    count: questions.length,
    data: questions
  });
});

// Get single question
const getQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const question = await Question.findById(id);
  
  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  res.json({
    success: true,
    data: question
  });
});

// Create new question (admin only)
const createQuestion = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { 
    categoryId, 
    questionAr, 
    questionEn, 
    answerAr, 
    answerEn, 
    points, 
    difficulty, 
    imageUrl, 
    answerImageUrl 
  } = req.body;

  const questionId = await Question.create({
    categoryId,
    questionAr,
    questionEn,
    answerAr,
    answerEn,
    points,
    difficulty,
    imageUrl,
    answerImageUrl
  });

  const question = await Question.findById(questionId);

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: question
  });
});

// Create multiple questions (admin only)
const createMultipleQuestions = asyncHandler(async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of questions'
    });
  }

  const results = await Question.importMany(questions);

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  res.json({
    success: true,
    message: `Imported ${successCount} questions, ${failCount} failed`,
    data: {
      total: questions.length,
      success: successCount,
      failed: failCount,
      results
    }
  });
});

// Update question (admin only)
const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    categoryId, 
    questionAr, 
    questionEn, 
    answerAr, 
    answerEn, 
    points, 
    difficulty, 
    imageUrl, 
    answerImageUrl, 
    isActive 
  } = req.body;
  
  const question = await Question.findById(id);
  
  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  const updates = {};
  if (categoryId !== undefined) updates.categoryId = categoryId;
  if (questionAr !== undefined) updates.questionAr = questionAr;
  if (questionEn !== undefined) updates.questionEn = questionEn;
  if (answerAr !== undefined) updates.answerAr = answerAr;
  if (answerEn !== undefined) updates.answerEn = answerEn;
  if (points !== undefined) updates.points = points;
  if (difficulty !== undefined) updates.difficulty = difficulty;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (answerImageUrl !== undefined) updates.answerImageUrl = answerImageUrl;
  if (isActive !== undefined) updates.isActive = isActive;

  await Question.update(id, updates);
  
  const updatedQuestion = await Question.findById(id);

  res.json({
    success: true,
    message: 'Question updated successfully',
    data: updatedQuestion
  });
});

// Delete question (admin only)
const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const question = await Question.findById(id);
  
  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  await Question.delete(id);

  res.json({
    success: true,
    message: 'Question deleted successfully'
  });
});

// Toggle question active status (admin only)
const toggleQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const question = await Question.findById(id);
  
  if (!question) {
    return res.status(404).json({
      success: false,
      message: 'Question not found'
    });
  }

  await Question.toggleActive(id);
  
  const updatedQuestion = await Question.findById(id);

  res.json({
    success: true,
    message: 'Question status toggled successfully',
    data: updatedQuestion
  });
});

// Get random questions for game
const getRandomQuestions = asyncHandler(async (req, res) => {
  const { categoryIds, questionsPerCategory = 6 } = req.body;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide category IDs array'
    });
  }

  const questions = await Question.getRandomForGame(
    categoryIds, 
    parseInt(questionsPerCategory)
  );

  // Group questions by category
  const grouped = {};
  questions.forEach(q => {
    const catId = q.category_id;
    if (!grouped[catId]) {
      grouped[catId] = {
        categoryId: catId,
        categoryName: {
          ar: q.category_name_ar,
          en: q.category_name_en
        },
        categoryImage: q.category_image,
        questions: []
      };
    }
    grouped[catId].questions.push({
      id: q.id,
      question: { ar: q.question_ar, en: q.question_en },
      answer: { ar: q.answer_ar, en: q.answer_en },
      points: q.points,
      difficulty: q.difficulty,
      imageUrl: q.image_url,
      answerImageUrl: q.answer_image_url
    });
  });

  res.json({
    success: true,
    count: questions.length,
    data: Object.values(grouped)
  });
});

// Get question statistics (admin only)
const getQuestionStats = asyncHandler(async (req, res) => {
  const stats = await Question.getStats();

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
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
};
