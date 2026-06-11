const GameSession = require('../models/GameSession');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// Validation rules
const gameSessionValidation = [
  body('team1Name').trim().notEmpty().withMessage('Team 1 name is required'),
  body('team2Name').trim().notEmpty().withMessage('Team 2 name is required')
];

// Create new game session
const createGameSession = asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { sessionName, team1Name, team2Name } = req.body;

  const sessionId = await GameSession.create({
    sessionName: sessionName || `Game ${new Date().toISOString()}`,
    team1Name,
    team2Name,
    createdBy: req.user ? req.user.id : null
  });

  const session = await GameSession.findById(sessionId);

  res.status(201).json({
    success: true,
    message: 'Game session created successfully',
    data: session
  });
});

// Get all game sessions
const getAllGameSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  
  const result = await GameSession.getAll({
    page: parseInt(page),
    limit: parseInt(limit),
    status
  });

  res.json({
    success: true,
    data: result
  });
});

// Get user's game sessions
const getMyGameSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const result = await GameSession.getUserHistory(req.user.id, {
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    data: result
  });
});

// Get single game session
const getGameSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const session = await GameSession.findById(id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Game session not found'
    });
  }

  // Get session questions
  const questions = await GameSession.getSessionQuestions(id);
  
  // Get session statistics
  const stats = await GameSession.getStats(id);

  res.json({
    success: true,
    data: {
      ...session,
      questions,
      stats
    }
  });
});

// Update game scores
const updateGameScores = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { team1Score, team2Score } = req.body;
  
  const session = await GameSession.findById(id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Game session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update scores for completed or abandoned game'
    });
  }

  await GameSession.updateScores(id, { team1Score, team2Score });
  
  const updatedSession = await GameSession.findById(id);

  res.json({
    success: true,
    message: 'Scores updated successfully',
    data: updatedSession
  });
});

// End game session
const endGameSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { winner } = req.body;
  
  const session = await GameSession.findById(id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Game session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Game session is already ended'
    });
  }

  await GameSession.end(id, winner);
  
  // Update user stats if game was created by a user
  if (session.created_by && winner) {
    const winningTeam = winner === session.team1_name ? 1 : 2;
    await User.updateStats(session.created_by, {
      gamesPlayed: 1,
      gamesWon: winningTeam
    });
  }
  
  const updatedSession = await GameSession.findById(id);

  res.json({
    success: true,
    message: 'Game session ended successfully',
    data: updatedSession
  });
});

// Abandon game session
const abandonGameSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const session = await GameSession.findById(id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Game session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Game session is already ended'
    });
  }

  await GameSession.abandon(id);
  
  const updatedSession = await GameSession.findById(id);

  res.json({
    success: true,
    message: 'Game session abandoned',
    data: updatedSession
  });
});

// Delete game session (admin only)
const deleteGameSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const session = await GameSession.findById(id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Game session not found'
    });
  }

  await GameSession.delete(id);

  res.json({
    success: true,
    message: 'Game session deleted successfully'
  });
});

// Record a question being asked
const recordQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionId, askedByTeam, answeredByTeam, isCorrect, pointsEarned } = req.body;
  
  const session = await GameSession.findById(id);
  
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Game session not found'
    });
  }

  if (session.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Cannot record questions for ended game'
    });
  }

  const recordId = await GameSession.recordQuestion({
    sessionId: id,
    questionId,
    askedByTeam,
    answeredByTeam,
    isCorrect,
    pointsEarned
  });

  res.status(201).json({
    success: true,
    message: 'Question recorded successfully',
    data: { recordId }
  });
});

// Get game leaderboard
const getGameLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const leaderboard = await GameSession.getLeaderboard(parseInt(limit));

  res.json({
    success: true,
    data: leaderboard
  });
});

// Get dashboard statistics (admin only)
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total counts
  const [userCount] = await require('../config/database').query(
    'SELECT COUNT(*) as total FROM users WHERE is_active = TRUE'
  );
  
  const [categoryCount] = await require('../config/database').query(
    'SELECT COUNT(*) as total FROM categories WHERE is_active = TRUE'
  );
  
  const [questionCount] = await require('../config/database').query(
    'SELECT COUNT(*) as total FROM questions WHERE is_active = TRUE'
  );
  
  const [gameCount] = await require('../config/database').query(
    'SELECT COUNT(*) as total FROM game_sessions'
  );
  
  const [completedGameCount] = await require('../config/database').query(
    "SELECT COUNT(*) as total FROM game_sessions WHERE status = 'completed'"
  );

  // Get recent games
  const recentGames = await require('../config/database').query(
    `SELECT gs.*, u.username as created_by_username
     FROM game_sessions gs
     LEFT JOIN users u ON gs.created_by = u.id
     ORDER BY gs.created_at DESC
     LIMIT 5`
  );

  // Get top players
  const topPlayers = await User.getLeaderboard(5);

  res.json({
    success: true,
    data: {
      counts: {
        users: userCount.total,
        categories: categoryCount.total,
        questions: questionCount.total,
        games: gameCount.total,
        completedGames: completedGameCount.total
      },
      recentGames,
      topPlayers
    }
  });
});

module.exports = {
  gameSessionValidation,
  createGameSession,
  getAllGameSessions,
  getMyGameSessions,
  getGameSession,
  updateGameScores,
  endGameSession,
  abandonGameSession,
  deleteGameSession,
  recordQuestion,
  getGameLeaderboard,
  getDashboardStats
};
