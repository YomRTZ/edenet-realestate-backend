import express from 'express';
import { register, login, refreshToken, logout, getLoginActivity } from '../controllers/auth.controller.js';
import { requestOTP, checkOTP, declineOTP, verifyOTP } from '../controllers/otp.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema, logoutSchema, requestOTPSchema, verifyOTPSchema } from '../utils/validators.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/login-activity', verifyToken, getLoginActivity);

/* OTP Routes */
router.post('/otp/request', validate(requestOTPSchema), requestOTP);
router.post('/otp/check', validate(requestOTPSchema), checkOTP);
router.post('/otp/decline', validate(requestOTPSchema), declineOTP);
router.post('/otp/verify', validate(verifyOTPSchema), verifyOTP);

/* Get current user */
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await models.User.findByPk(req.user.id);
    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        is_verified_agent: user.is_verified_agent,
        profile_image: user.profile_image,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

