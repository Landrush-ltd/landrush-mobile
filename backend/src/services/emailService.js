import transporter from '../config/email.js';
import dotenv from 'dotenv';

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8081';

export async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Landrush',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D6A4F;">Welcome to Landrush! 🎉</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #2D6A4F; font-size: 48px; letter-spacing: 8px;">${otp}</h1>
        <p style="color: #666; font-size: 14px;">This code expires in 15 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email, resetToken) {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - Landrush',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D6A4F;">Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #2D6A4F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Or copy this link: <br>
          <code style="background-color: #f5f5f5; padding: 10px; display: block; margin-top: 10px; word-break: break-all;">
            ${resetLink}
          </code>
        </p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(email, firstName) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Landrush - Your Land Marketplace',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D6A4F;">Welcome to Landrush, ${firstName}! 🎉</h2>
        <p>Your email has been verified successfully.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse land listings across Nigeria</li>
          <li>Save your favorite properties</li>
          <li>Connect with verified agents</li>
          <li>Schedule property inspections</li>
        </ul>
        <p style="margin-top: 20px;">
          <a href="${FRONTEND_URL}" style="display: inline-block; background-color: #9FBB44; color: #222; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Start Exploring
          </a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Landrush Team<br>
          Your trusted land marketplace
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}
