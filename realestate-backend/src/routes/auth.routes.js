import express from 'express';

import { authController } from '../controllers/auth.controller.js';

import {
  validateSession,
} from '../middleware/validateSession.middleware.js';

export const authRouter = express.Router();

authRouter.post('/nonce', authController.getNonce);

authRouter.post('/login', authController.login);

authRouter.post('/refresh', authController.refresh);

authRouter.get(
  '/me',
  validateSession,
  (req, res) => {
    return res.json({
      account: req.user.walletAddress,
      role: req.user.role,
      isOwner: req.user.isOwner,
      isTenant: req.user.isTenant,
    });
  }
);

authRouter.post(
  '/citizen/update-status',
  validateSession,
  authController.updateStatus
);

authRouter.post(
  '/logout',
  authController.logout
);

export default authRouter;