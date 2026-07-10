import pool from '../config/database.js';
import {
  generateOTP,
  hashPassword,
  comparePassword,
  generateJWT,
  generateToken,
  getOTPExpiration,
  getTokenExpiration,
  formatError,
  formatSuccess,
} from '../utils/helpers.js';
import {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../services/emailService.js';

// Sign up with email
export async function signup(req, res) {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    // Validate input
    if (!email || !password || !firstName) {
      return res.status(400).json(formatError('Missing required fields'));
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json(formatError('Email already registered'));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, email_verified`,
      [firstName, lastName, email, hashedPassword, phone, role || 'buyer']
    );

    const user = userResult.rows[0];

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Store OTP in database
    await pool.query(
      `INSERT INTO email_verifications (user_id, code, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, otp, expiresAt]
    );

    // Send OTP email
    await sendOTPEmail(email, otp);

    // Generate JWT token
    const token = generateJWT(user.id);

    res.status(201).json(
      formatSuccess(
        {
          userId: user.id,
          email: user.email,
          firstName: user.first_name,
          emailVerified: user.email_verified,
          token,
        },
        'Signup successful! Check your email for verification code.'
      )
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json(formatError('Signup failed'));
  }
}

// Verify OTP
export async function verifyOTP(req, res) {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json(formatError('Missing userId or code'));
    }

    // Get OTP record
    const otpResult = await pool.query(
      `SELECT id, user_id, expires_at, verified_at, attempts
       FROM email_verifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (otpResult.rows.length === 0) {
      return res.status(404).json(formatError('No OTP found for this user'));
    }

    const otp = otpResult.rows[0];

    // Check if already verified
    if (otp.verified_at) {
      return res.status(400).json(formatError('Email already verified'));
    }

    // Check if expired
    if (new Date() > new Date(otp.expires_at)) {
      return res.status(400).json(formatError('OTP expired'));
    }

    // Check attempts
    if (otp.attempts >= 5) {
      return res.status(400).json(formatError('Too many attempts'));
    }

    // Verify code
    const verifyResult = await pool.query(
      `SELECT id FROM email_verifications
       WHERE user_id = $1 AND code = $2 AND verified_at IS NULL`,
      [userId, code]
    );

    if (verifyResult.rows.length === 0) {
      // Increment attempts
      await pool.query(
        `UPDATE email_verifications
         SET attempts = attempts + 1
         WHERE user_id = $1`,
        [userId]
      );
      return res.status(400).json(formatError('Invalid OTP code'));
    }

    // Mark as verified
    await pool.query(
      `UPDATE email_verifications
       SET verified_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND code = $2`,
      [userId, code]
    );

    // Update user email_verified status
    const userResult = await pool.query(
      `UPDATE users
       SET email_verified = true
       WHERE id = $1
       RETURNING id, email, first_name`,
      [userId]
    );

    const user = userResult.rows[0];

    // Send welcome email
    await sendWelcomeEmail(user.email, user.first_name);

    res.json(
      formatSuccess(
        { userId: user.id, emailVerified: true },
        'Email verified successfully!'
      )
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json(formatError('Verification failed'));
  }
}

// Resend OTP
export async function resendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(formatError('Email is required'));
    }

    // Get user
    const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json(formatError('User not found'));
    }

    const user = userResult.rows[0];

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Insert new OTP
    await pool.query(
      `INSERT INTO email_verifications (user_id, code, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, otp, expiresAt]
    );

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json(formatSuccess({}, 'OTP sent to your email'));
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json(formatError('Failed to resend OTP'));
  }
}

// Login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(formatError('Email and password required'));
    }

    // Get user
    const userResult = await pool.query(
      'SELECT id, email, password, first_name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json(formatError('Invalid credentials'));
    }

    const user = userResult.rows[0];

    // Compare password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json(formatError('Invalid credentials'));
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json(formatError('Please verify your email first'));
    }

    // Generate token
    const token = generateJWT(user.id);

    res.json(
      formatSuccess(
        {
          userId: user.id,
          email: user.email,
          firstName: user.first_name,
          token,
        },
        'Login successful'
      )
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(formatError('Login failed'));
  }
}

// Forgot password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(formatError('Email is required'));
    }

    // Get user
    const userResult = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists
      return res.json(formatSuccess({}, 'If account exists, reset link will be sent'));
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = generateToken();
    const expiresAt = getTokenExpiration();

    // Store reset token
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    res.json(formatSuccess({}, 'Password reset link sent to your email'));
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(formatError('Failed to process request'));
  }
}

// Reset password
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json(formatError('Token and new password required'));
    }

    // Get reset record
    const resetResult = await pool.query(
      `SELECT user_id, expires_at FROM password_resets
       WHERE token = $1 AND used_at IS NULL`,
      [token]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json(formatError('Invalid or expired reset token'));
    }

    const reset = resetResult.rows[0];

    // Check if expired
    if (new Date() > new Date(reset.expires_at)) {
      return res.status(400).json(formatError('Reset token expired'));
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [
      hashedPassword,
      reset.user_id,
    ]);

    // Mark token as used
    await pool.query('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE token = $1', [
      token,
    ]);

    res.json(formatSuccess({}, 'Password reset successfully'));
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(formatError('Password reset failed'));
  }
}
