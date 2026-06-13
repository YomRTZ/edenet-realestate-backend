// src/routes/auth.js
const express    = require('express');
const rateLimit  = require('express-rate-limit');
const router     = express.Router();
const authController = require('../controllers/authController');
const auth       = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  verifyOtpSchema,
  resendOtpSchema,
  connectWalletSchema,
} = require('../validation/authSchemas');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register',          authLimiter, validate(registerSchema),      authController.register);
router.post('/google',                         validate(googleAuthSchema),     authController.googleAuth);
router.post('/verify-otp',        authLimiter, validate(verifyOtpSchema),      authController.verifyOtp);
router.post('/resend-otp',        authLimiter, validate(resendOtpSchema),      authController.resendOtp);
router.post('/login',                          validate(loginSchema),           authController.login);
router.post('/connect-wallet',    auth,        validate(connectWalletSchema),  authController.connectWallet);
router.post('/disconnect-wallet', auth,                                         authController.disconnectWallet);
router.get('/me',                 auth,                                         authController.getMe);

module.exports = router;
