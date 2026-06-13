// src/validation/authSchemas.js
const { z } = require('zod');

const emailField    = z.string().trim().email('Invalid email address').toLowerCase();
const passwordField = z.string().min(8, 'Password must be at least 8 characters');
const walletField   = z.string().trim().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum wallet address');

const registerSchema = z.object({
  email:           emailField,
  password:        passwordField,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
});

const loginSchema = z.object({
  email:    emailField,
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

const verifyOtpSchema = z.object({
  email: emailField,
  code:  z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

const resendOtpSchema = z.object({
  email: emailField,
});

const connectWalletSchema = z.object({
  walletAddress: walletField,
  signature:     z.string().min(1, 'Signature is required'),
  message:       z.string().min(1, 'Message is required'),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  verifyOtpSchema,
  resendOtpSchema,
  connectWalletSchema,
};
