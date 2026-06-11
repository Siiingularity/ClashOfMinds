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
const {
  getCategoryGroups,
  addCategoryGroup,
  bulkAddCategoryGroups,
  updateCategoryGroup,
  deleteCategoryGroup,
  deleteAllCategoryGroups,
} = require('../controllers/gameCategoryGroupController');

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

// ── Category Groups routes ──────────────────────────────────────────────────
// GET    /api/games/:id/category-groups         → list all for session
// POST   /api/games/:id/category-groups         → add one
// POST   /api/games/:id/category-groups/bulk    → add many at once
// PUT    /api/games/:id/category-groups/:groupId → update one
// DELETE /api/games/:id/category-groups/:groupId → delete one
// DELETE /api/games/:id/category-groups          → reset all for session

router.get('/:id/category-groups', authenticate, getCategoryGroups);
router.post('/:id/category-groups/bulk', authenticate, bulkAddCategoryGroups);
router.post('/:id/category-groups', authenticate, addCategoryGroup);
router.put('/:id/category-groups/:groupId', authenticate, updateCategoryGroup);
router.delete('/:id/category-groups/:groupId', authenticate, deleteCategoryGroup);
router.delete('/:id/category-groups', authenticate, requireAdmin, deleteAllCategoryGroups);

module.exports = router;
