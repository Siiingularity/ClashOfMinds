const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');

// Validation
const startRegisterValidation = [
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

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 characters'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const verifyRegisterValidation = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),

  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
];

const resendOtpValidation = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
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

// Start registration
const startRegister = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  await PendingRegistration.cleanupExpired();

  const { username, email, phone, password } = req.body;
  const normalizedPhone = PendingRegistration.normalizePhone(phone);

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

  const existingPhone = await User.findByPhone(normalizedPhone);
  if (existingPhone) {
    return res.status(409).json({
      success: false,
      message: 'Phone number already registered'
    });
  }

  const result = await PendingRegistration.createOrUpdate({
    username,
    email,
    phone: normalizedPhone,
    password
  });

  // مؤقت للتجربة فقط لحد ما نربط SMS provider
  return res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      phone: result.phone,
      devOtp: result.otpCode
    }
  });
});

// Verify registration
const verifyRegister = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { phone, otp } = req.body;
  const normalizedPhone = PendingRegistration.normalizePhone(phone);

  const verification = await PendingRegistration.verifyOTP(normalizedPhone, otp);

  if (!verification.ok) {
    let message = 'OTP verification failed';

    if (verification.reason === 'not_found') {
      message = 'Pending registration not found';
    } else if (verification.reason === 'expired') {
      message = 'OTP has expired';
    } else if (verification.reason === 'too_many_attempts') {
      message = 'Too many failed attempts. Please register again';
    } else if (verification.reason === 'invalid_code') {
      message = 'Invalid OTP code';
    }

    return res.status(400).json({
      success: false,
      message
    });
  }

  const pendingUser = verification.record;

  const existingUsername = await User.findByUsername(pendingUser.username);
  if (existingUsername) {
    return res.status(409).json({
      success: false,
      message: 'Username already taken'
    });
  }

  const existingEmail = await User.findByEmail(pendingUser.email);
  if (existingEmail) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered'
    });
  }

  const existingPhone = await User.findByPhone(normalizedPhone);
  if (existingPhone) {
    return res.status(409).json({
      success: false,
      message: 'Phone number already registered'
    });
  }

const userId = await User.create({
  username: pendingUser.username,
  email: pendingUser.email,
  phone: pendingUser.phone,
  password: pendingUser.password,
  isHashed: true
});

  await PendingRegistration.deleteByPhone(normalizedPhone);

  return res.status(201).json({
    success: true,
    message: 'Phone verified and account created successfully',
    data: {
      userId
    }
  });
});

// Resend OTP
const resendRegisterOtp = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  await PendingRegistration.cleanupExpired();

  const { phone } = req.body;
  const normalizedPhone = PendingRegistration.normalizePhone(phone);

  const pending = await PendingRegistration.findByPhone(normalizedPhone);

  if (!pending) {
    return res.status(404).json({
      success: false,
      message: 'Pending registration not found'
    });
  }

  const newOtp = await PendingRegistration.incrementResend(normalizedPhone);

  return res.json({
    success: true,
    message: 'OTP resent successfully',
    data: {
      phone: normalizedPhone,
      devOtp: newOtp
    }
  });
});

// Disable direct register
const register = asyncHandler(async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Direct registration is disabled. Please verify phone first'
  });
});

// Login
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
      phone: user.phone,
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
  const { username, email, phone } = req.body;
  const updates = {};

  if (username) updates.username = username;
  if (email) updates.email = email;
  if (phone) updates.phone = PendingRegistration.normalizePhone(phone);

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

  const fullUser = await User.findByEmail(user.email);
  const isPasswordValid = await User.verifyPassword(currentPassword, fullUser.password);

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
  startRegisterValidation,
  verifyRegisterValidation,
  resendOtpValidation,
  loginValidation,
  startRegister,
  verifyRegister,
  resendRegisterOtp,
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
