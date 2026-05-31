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
    const user = await models.User.findByPk(req.user.id, { include: models.Role });
    if (!user) throw new AppError('User not found', 404);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: [user.Role?.role_name],
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

