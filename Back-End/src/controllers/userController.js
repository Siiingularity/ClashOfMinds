const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all users (admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', role } = req.query;
  
  const result = await User.getAll({
    page: parseInt(page),
    limit: parseInt(limit),
    search,
    role
  });

  res.json({
    success: true,
    data: result
  });
});

// Get user by ID (admin only)
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user
  });
});

// Update user (admin only)
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, isActive, role, games_purchased } = req.body;
  
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const updates = {};
  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (isActive !== undefined) updates.isActive = isActive;
  if (role !== undefined && ['user', 'editor', 'admin'].includes(role)) updates.role = role;
  if (games_purchased !== undefined) updates.games_purchased = games_purchased;

  await User.update(id, updates);
  
  const updatedUser = await User.findById(id);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
});

// Delete user (admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deleting yourself
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  await User.delete(id);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// Get leaderboard
const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const leaderboard = await User.getLeaderboard(parseInt(limit));

  res.json({
    success: true,
    data: leaderboard
  });
});

// Get user statistics (admin only)
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.getStats();

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getLeaderboard,
  getUserStats
};
