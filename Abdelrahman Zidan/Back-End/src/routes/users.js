const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getLeaderboard,
  getUserStats
} = require('../controllers/userController');

// Public routes
router.get('/leaderboard', getLeaderboard);

// Protected admin routes
router.get('/', authenticate, requireAdmin, getAllUsers);
router.get('/stats', authenticate, requireAdmin, getUserStats);
router.get('/:id', authenticate, requireAdmin, getUserById);
router.put('/:id', authenticate, requireAdmin, updateUser);
router.delete('/:id', authenticate, requireAdmin, deleteUser);

module.exports = router;
