import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authorizeSession } from '../middleware/authSession.middleware.js';

export const authRouter = express.Router();

authRouter.post('/nonce', authController.getNonce);
authRouter.post('/login', authController.login);
// Dev-only helper: generate a nonce without DB (useful when DB is unavailable locally)
authRouter.post('/dev-nonce', authController.devNonce);
authRouter.get('/me', authorizeSession, (req, res) => res.json({ account: req.user.walletAddress, role: req.user.role, isOwner: req.user.isOwner, isTenant: req.user.isTenant }));
authRouter.post('/citizen/update-status', authorizeSession, authController.updateStatus);
authRouter.post('/logout', authController.logout);

export default authRouter;
