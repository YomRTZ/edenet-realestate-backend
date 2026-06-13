// src/services/authService.js
// Business logic for authentication: register, OTP, login, wallet, Google OAuth.
// Input shape is guaranteed by zod schemas in routes — no redundant field checks here.

const bcrypt  = require('bcrypt');
const { ethers } = require('ethers');
const { OAuth2Client } = require('google-auth-library');
const prisma  = require('../config/db');
const { generateToken } = require('../utils/jwt');
const { sendOtp }       = require('../utils/email');
const { notifyAdmin }   = require('../utils/notifications');

const SALT_ROUNDS       = 10;
const OTP_EXPIRY_MINUTES = 10;
const googleClient      = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Private helpers ───────────────────────────────────────────────────────────

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildUserPayload(user) {
  return { id: user.id, email: user.email, status: user.status, walletAddress: user.walletAddress };
}

// ── Service methods ───────────────────────────────────────────────────────────

async function register(email, password, confirmPassword) {
  // confirmPassword equality already checked by zod refine — keep here as
  // a defence-in-depth guard for any caller that bypasses the HTTP layer.
  if (password !== confirmPassword) {
    throw Object.assign(new Error('Passwords do not match'), { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw Object.assign(new Error('An account with this email already exists'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, status: 'PENDING_EMAIL' },
  });

  const otpCode  = generateOtpCode();
  const codeHash = await bcrypt.hash(otpCode, SALT_ROUNDS);
  await prisma.otpCode.create({
    data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000) },
  });

  console.log(`[DEV] OTP for ${user.email}: ${otpCode}`); // remove in production
  sendOtp(user.email, otpCode).catch((err) =>
    console.error('[authService] OTP email failed (non-fatal):', err.message)
  );

  notifyAdmin('USER_REGISTERED', 'New user registered', `${user.email} created an account.`, '/dashboard/users');

  return { message: 'Registration successful. Please check your email for the verification code.', email: user.email };
}

async function googleAuth(credential) {
  const ticket  = await googleClient.verifyIdToken({
    idToken:  credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email   = payload.email.toLowerCase();

  if (!payload.email_verified) {
    throw Object.assign(new Error('Google email is not verified'), { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: { email, passwordHash: null, authProvider: 'GOOGLE', status: 'PENDING_KYC' },
    });
  } else if (user.authProvider === 'EMAIL') {
    throw Object.assign(
      new Error('This email is registered with a password. Please use email/password login.'),
      { status: 403 }
    );
  }

  return { message: 'Google authentication successful', token: generateToken(user), user: buildUserPayload(user) };
}

async function verifyOtp(email, code) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const otpRecord = await prisma.otpCode.findFirst({
    where:   { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: 'desc' },
  });
  if (!otpRecord) {
    throw Object.assign(new Error('Invalid or expired OTP. Please request a new one.'), { status: 400 });
  }

  const isValid = await bcrypt.compare(code, otpRecord.codeHash);
  if (!isValid) throw Object.assign(new Error('Invalid OTP code'), { status: 400 });

  await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });
  const updated = await prisma.user.update({ where: { id: user.id }, data: { status: 'PENDING_KYC' } });

  return { message: 'Email verified successfully', token: generateToken(updated), user: buildUserPayload(updated) };
}

async function resendOtp(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  if (user.status !== 'PENDING_EMAIL') {
    throw Object.assign(new Error('Email already verified'), { status: 400 });
  }

  const otpCode  = generateOtpCode();
  const codeHash = await bcrypt.hash(otpCode, SALT_ROUNDS);
  await prisma.otpCode.create({
    data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000) },
  });

  await sendOtp(user.email, otpCode);
  return { message: 'New OTP sent to your email' };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Return same error for missing user or wrong password — prevents user enumeration
  if (!user || !user.passwordHash) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  if (user.status === 'PENDING_EMAIL') {
    throw Object.assign(
      new Error('Email not verified. Please verify your email first.'),
      { status: 403, requiresOtp: true }
    );
  }

  return { message: 'Login successful', token: generateToken(user), user: buildUserPayload(user) };
}

async function connectWallet(userId, walletAddress, signature, message) {
  const existing = await prisma.user.findUnique({ where: { walletAddress } });
  if (existing && existing.id !== userId) {
    throw Object.assign(new Error('This wallet is already linked to another account'), { status: 409 });
  }

  // Verify MetaMask signature — ethers v6 top-level verifyMessage
  try {
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      throw Object.assign(new Error('Signature verification failed'), { status: 400 });
    }
  } catch (err) {
    if (err.status) throw err;
    throw Object.assign(new Error('Invalid signature'), { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data:  { walletAddress },
  });

  return { message: 'Wallet connected successfully', token: generateToken(updated), user: buildUserPayload(updated) };
}

async function disconnectWallet(userId) {
  const updated = await prisma.user.update({ where: { id: userId }, data: { walletAddress: null } });
  return { message: 'Wallet disconnected successfully', token: generateToken(updated), user: buildUserPayload(updated) };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { id: true, email: true, status: true, walletAddress: true, createdAt: true },
  });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const govWallet = (process.env.GOV_WALLET || '').toLowerCase();
  const role = user.walletAddress
    ? user.walletAddress.toLowerCase() === govWallet ? 'GOVERNMENT' : 'CITIZEN'
    : null;

  return { ...user, role };
}

module.exports = { register, googleAuth, verifyOtp, resendOtp, login, connectWallet, disconnectWallet, getMe };
