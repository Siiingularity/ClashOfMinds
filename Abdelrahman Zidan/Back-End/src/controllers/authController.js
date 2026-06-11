const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  body('emailOrUsername')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register new user
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, email, password } = req.body;

  const existingUsername = await User.findByUsername(username);
  if (existingUsername) {
    return res.status(409).json({
      success: false,
      message: 'Username already taken'
    });
  }

  const existingEmail = await User.findByEmail(email);
  if (existingEmail) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered'
    });
  }

  const userId = await User.create({ username, email, password });
  const token = generateToken(userId);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      userId,
      username,
      email,
      token
    }
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { emailOrUsername, password } = req.body;

  let user = await User.findByUsername(emailOrUsername);

  if (!user) {
    user = await User.findByEmail(emailOrUsername);
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username/email or password'
    });
  }

  if (!user.is_active) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  const isPasswordValid = await User.verifyPassword(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username/email or password'
    });
  }

  await User.updateLastLogin(user.id);

  const token = generateToken(user.id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    }
  });
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: user
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const updates = {};

  if (username) updates.username = username;
  if (email) updates.email = email;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
  }

  await User.update(req.user.id, updates);

  const updatedUser = await User.findById(req.user.id);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  await User.update(req.user.id, { password: newPassword });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = {
  registerValidation,
  loginValidation,
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
