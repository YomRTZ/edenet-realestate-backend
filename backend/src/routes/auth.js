// src/routes/auth.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register',        authLimiter, authController.register);
router.post('/google',                       authController.googleAuth);
router.post('/verify-otp',      authLimiter, authController.verifyOtp);
router.post('/resend-otp',      authLimiter, authController.resendOtp);
router.post('/login',                        authController.login);
router.post('/connect-wallet',  auth,        authController.connectWallet);
router.post('/disconnect-wallet', auth,      authController.disconnectWallet);
router.get('/me',               auth,        authController.getMe);

module.exports = router;
