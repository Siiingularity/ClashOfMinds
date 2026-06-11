const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
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
} = require('../controllers/gameController');

// Public routes
router.get('/leaderboard', getGameLeaderboard);

// Protected routes
router.post('/', authenticate, gameSessionValidation, createGameSession);
router.get('/my-games', authenticate, getMyGameSessions);
router.get('/:id', authenticate, getGameSession);
router.put('/:id/scores', authenticate, updateGameScores);
router.post('/:id/record-question', authenticate, recordQuestion);
router.post('/:id/end', authenticate, endGameSession);
router.post('/:id/abandon', authenticate, abandonGameSession);

// Admin routes
router.get('/', authenticate, requireAdmin, getAllGameSessions);
router.get('/dashboard/stats', authenticate, requireAdmin, getDashboardStats);
router.delete('/:id', authenticate, requireAdmin, deleteGameSession);

module.exports = router;
