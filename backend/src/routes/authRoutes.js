import express from 'express';
import {
  signup,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Verify OTP route
router.post('/verify-otp', verifyOTP);

// Resend OTP route
router.post('/resend-otp', resendOTP);

// Login route
router.post('/login', login);

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password', resetPassword);

export default router;
