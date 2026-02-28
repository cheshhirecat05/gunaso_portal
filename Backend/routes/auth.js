const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

// ─── Gmail SMTP Transporter ───
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send OTP email via Gmail SMTP.
 * @param {string} to    - Recipient email address
 * @param {string} otp   - 6-digit OTP code
 */
async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"Gunaso Portal" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Gunaso Portal — Password Reset OTP',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: #1b263b; color: #fca311; font-size: 28px; font-weight: 700; width: 50px; height: 50px; line-height: 50px; border-radius: 12px;">G</div>
          <h2 style="color: #1b263b; margin: 12px 0 0;">Gunaso Portal</h2>
        </div>
        <div style="background: white; border-radius: 10px; padding: 28px; text-align: center;">
          <p style="color: #555; font-size: 15px; margin-bottom: 20px;">You requested a password reset. Use the OTP below to verify your identity:</p>
          <div style="background: #1b263b; color: #fca311; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 16px 24px; border-radius: 8px; display: inline-block; font-family: 'JetBrains Mono', monospace;">
            ${otp}
          </div>
          <p style="color: #888; font-size: 13px; margin-top: 20px;">This code expires in <strong>5 minutes</strong>.</p>
          <p style="color: #888; font-size: 13px;">If you didn't request this, please ignore this email.</p>
        </div>
        <p style="text-align: center; color: #aaa; font-size: 11px; margin-top: 20px;">© Gunaso Portal — Civic Grievance Management System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Generate citizen ID
function generateCitizenId() {
  return 'CIT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ─── Citizen Register ───
router.post('/citizen/register', async (req, res) => {
  try {
    const { name, phone, email, address, password } = req.body;

    if (!name || !email || !address || !password) {
      return res.status(400).json({ error: 'Please fill all required fields.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const citizenId = generateCitizenId();

    const user = await User.create({
      citizenId,
      name,
      phone: phone || '',
      email: email.toLowerCase(),
      address,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'Account created! You can now log in.',
      user: {
        id: user.citizenId,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── Citizen Login ───
router.post('/citizen/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please fill all fields.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.citizenId,
      email: user.email,
      type: 'citizen',
    });

    res.json({
      token,
      session: {
        type: 'citizen',
        user: {
          id: user.citizenId,
          name: user.name,
          phone: user.phone,
          email: user.email,
          address: user.address,
          registeredAt: user.registeredAt,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── Admin Login ───
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter credentials.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials. Please try again.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials. Please try again.' });
    }

    const token = generateToken({
      id: admin._id,
      email: admin.email,
      type: 'admin',
    });

    res.json({
      token,
      session: {
        type: 'admin',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── Forgot Password - Send OTP via Gmail ───
const otpStore = new Map(); // email -> { otp, expiresAt }

router.post('/citizen/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Send OTP via Gmail SMTP
    try {
      await sendOtpEmail(email.toLowerCase(), otp);
      console.log(`OTP sent to ${email}`);
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr.message);
      otpStore.delete(email.toLowerCase());
      return res.status(500).json({ error: 'Failed to send OTP email. Please try again later.' });
    }

    res.json({
      message: 'OTP has been sent to your email. Please check your inbox.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── Verify OTP ───
router.post('/citizen/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Please provide email and OTP.' });
    }

    const stored = otpStore.get(email.toLowerCase());
    if (!stored) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
    }

    // OTP verified — generate a temporary reset token
    const resetToken = jwt.sign(
      { email: email.toLowerCase(), purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    otpStore.delete(email.toLowerCase());

    res.json({ message: 'OTP verified.', resetToken });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── Reset Password ───
router.post('/citizen/reset-password', async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res.status(400).json({ error: 'Please provide token and new password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ error: 'Invalid token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { email: decoded.email },
      { password: hashedPassword }
    );

    res.json({ message: 'Password reset successfully! Please login with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ─── Get current user (for session restore) ───
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.type === 'citizen') {
      const user = await User.findOne({ citizenId: req.user.id }).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found.' });
      res.json({
        type: 'citizen',
        user: {
          id: user.citizenId,
          name: user.name,
          phone: user.phone,
          email: user.email,
          address: user.address,
          registeredAt: user.registeredAt,
        },
      });
    } else if (req.user.type === 'admin') {
      res.json({ type: 'admin' });
    }
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
