const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const { PrismaClient } = require('@prisma/client');
const rateLimit = require('express-rate-limit');
const { sendOtp } = require('../utils/email');
const { notifyUser, notifyAdmin } = require('../utils/notifications');
const auth = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    status: user.status,
    walletAddress: user.walletAddress
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

/**
 * Generate 6-digit OTP code
 */
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        status: 'PENDING_EMAIL'
      }
    });

    // Generate and send OTP
    const otpCode = generateOtpCode();
    const codeHash = await bcrypt.hash(otpCode, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt
      }
    });

    // Send OTP email (non-blocking — don't fail registration if email fails)
    console.log(`DEV OTP for ${user.email}: ${otpCode}`); // remove in production
    sendOtp(user.email, otpCode).catch((err) => {
      console.error('OTP email failed (non-fatal):', err.message);
    });

    notifyAdmin('USER_REGISTERED', 'New user registered', `${user.email} created an account.`, '/dashboard/users');

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/auth/google
 * Register or login with Google ID token
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();

    if (!payload.email_verified) {
      return res.status(400).json({ error: 'Google email is not verified' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // New user — create account, skip OTP since Google already verified email
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: null,
          authProvider: 'GOOGLE',
          status: 'PENDING_KYC',
        },
      });
    }

    // Existing user must be ACTIVE to log in via Google
    if (user.status !== 'ACTIVE' && user.authProvider === 'GOOGLE') {
      // allow continuing through onboarding (KYC flow) for non-active Google users
    } else if (user.status !== 'ACTIVE' && user.authProvider === 'EMAIL') {
      return res.status(403).json({
        error: 'This email is registered with a password. Please use email/password login, or complete your pending verification.',
      });
    }

    const token = generateToken(user);

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        walletAddress: user.walletAddress,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed. Please try again.' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP code and activate email
 */
router.post('/verify-otp', authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find latest unused, unexpired OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        expiresAt: 'desc'
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' });
    }

    // Verify code
    const isValid = await bcrypt.compare(code, otpRecord.codeHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true }
    });

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { status: 'PENDING_KYC' }
    });

    // Generate token
    const token = generateToken(updatedUser);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        walletAddress: updatedUser.walletAddress
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

/**
 * POST /api/auth/resend-otp
 * Resend OTP code to user's email
 */
router.post('/resend-otp', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.status !== 'PENDING_EMAIL') {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate and send new OTP
    const otpCode = generateOtpCode();
    const codeHash = await bcrypt.hash(otpCode, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt
      }
    });

    await sendOtp(user.email, otpCode);

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check email verification
    if (user.status === 'PENDING_EMAIL') {
      return res.status(403).json({ 
        error: 'Email not verified',
        message: 'Please verify your email first',
        requiresOtp: true
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/**
 * POST /api/auth/connect-wallet
 * Connect wallet to user account (requires authentication)
 */
router.post('/connect-wallet', auth, async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Wallet address, signature, and message are required' });
    }

    // Check if wallet is already linked to another account
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });

    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(409).json({ 
        error: 'This wallet is already linked to another account'
      });
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(400).json({ error: 'Signature verification failed' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update user with wallet address
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { walletAddress: walletAddress.toLowerCase() }
    });

    // Generate new token with updated wallet info
    const token = generateToken(updatedUser);

    res.json({
      message: 'Wallet connected successfully',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        walletAddress: updatedUser.walletAddress
      }
    });
  } catch (error) {
    console.error('Connect wallet error:', error);
    res.status(500).json({ error: 'Failed to connect wallet. Please try again.' });
  }
});

/**
 * POST /api/auth/disconnect-wallet
 * Disconnect wallet from user account (requires authentication)
 */
router.post('/disconnect-wallet', auth, async (req, res) => {
  try {
    // Update user to remove wallet address
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { walletAddress: null }
    });

    // Generate new token without wallet info
    const token = generateToken(updatedUser);

    res.json({
      message: 'Wallet disconnected successfully',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        walletAddress: null
      }
    });
  } catch (error) {
    console.error('Disconnect wallet error:', error);
    res.status(500).json({ error: 'Failed to disconnect wallet. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        status: true,
        walletAddress: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine role
    let role = null;
    if (user.walletAddress) {
      const govWallet = process.env.GOV_WALLET.toLowerCase();
      const userWallet = user.walletAddress.toLowerCase();
      role = userWallet === govWallet ? 'GOVERNMENT' : 'CITIZEN';
    }

    res.json({
      ...user,
      role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = router;
