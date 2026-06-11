const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const {
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
} = require('../controllers/authController');

// Public routes
router.post('/start-register', startRegisterValidation, startRegister);
router.post('/verify-register', verifyRegisterValidation, verifyRegister);
router.post('/resend-register-otp', resendOtpValidation, resendRegisterOtp);

// هذا أغلقناه عمدًا
router.post('/register', register);

router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
