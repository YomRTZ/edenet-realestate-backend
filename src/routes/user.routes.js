import express from 'express';
import {
  updateUser
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateUserSchema } from '../utils/validators.js';

const router = express.Router();

// User profile update route (all authenticated users)
router.use(verifyToken);
router.put('/profile', validate(updateUserSchema), updateUser);

export default router;
