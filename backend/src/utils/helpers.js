import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate 6-digit OTP code
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate random token for password reset
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateJWT(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
}

// Verify JWT token
export function verifyJWT(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
  } catch (error) {
    return null;
  }
}

// Get OTP expiration time (15 minutes from now)
export function getOTPExpiration() {
  return new Date(Date.now() + 15 * 60 * 1000);
}

// Get token expiration time (1 hour from now)
export function getTokenExpiration() {
  return new Date(Date.now() + 60 * 60 * 1000);
}

// Format error response
export function formatError(message, statusCode = 400) {
  return {
    success: false,
    message,
    statusCode,
  };
}

// Format success response
export function formatSuccess(data, message = 'Success') {
  return {
    success: true,
    message,
    data,
  };
}
