import { authService } from '../services/auth.service.js';

export const authController = {
  async getNonce(req, res) {
    console.log('getNonce called, body=', req.body);
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) return res.status(400).json({ error: 'Wallet allocation target required.' });

      const nonce = await authService.generateNonce(walletAddress);
      return res.json({ nonce });
    } catch (error) {
      console.error('getNonce error:', error && (error.stack || error));
      return res.status(500).json({ error: 'Failed to allocate cryptographic verification token.' });
    }
  },

  // Development helper: generate a nonce (uses authService so DB fallback is applied)
  async devNonce(req, res) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }
    try {
      const { walletAddress } = req.body || {};
      if (!walletAddress) return res.status(400).json({ error: 'Wallet allocation target required.' });
      const nonce = await authService.generateNonce(walletAddress);
      return res.json({ nonce });
    } catch (err) {
      console.error('devNonce error:', err && (err.stack || err));
      return res.status(500).json({ error: 'Could not generate dev nonce' });
    }
  },

  async login(req, res) {
    try {
      const { signature, walletAddress } = req.body;
      console.log('login called for walletAddress=', walletAddress);
      if (!signature || !walletAddress) return res.status(400).json({ error: 'Verification signatures missing.' });

      const { user, sessionToken } = await authService.verifyLogin(walletAddress, signature);

      res.cookie('sessionToken', sessionToken, {
        httpOnly: true,
        // Use secure cookies in production (HTTPS). For local development allow lax
        // so the browser will send the cookie from the dev frontend (different port).
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 2 * 60 * 60 * 1000
      });
      console.log('Set session cookie for', user && user.walletAddress, 'sameSite=', process.env.NODE_ENV === 'production' ? 'none' : 'lax');

      return res.json({ account: user.walletAddress, role: user.role, isOwner: user.isOwner, isTenant: user.isTenant });
    } catch (error) {
      console.error('login error:', error && (error.stack || error));
      if (error.message.includes('found') || error.message.includes('failed')) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Authentication system failure.' });
    }
  },

  async updateStatus(req, res) {
    try {
      const { action } = req.body;
      if (!action) return res.status(400).json({ error: 'Missing state update operational payload key.' });

      const updatedUser = await authService.updateCitizenStatus(req.user.id, action);
      return res.json({ isOwner: updatedUser.isOwner, isTenant: updatedUser.isTenant });
    } catch (error) {
      return res.status(500).json({ error: 'Could not apply profile structural flags changes.' });
    }
  },

  async logout(req, res) {
    try {
      const token = req.cookies && req.cookies.sessionToken;
      await authService.logout(token);
      res.clearCookie('sessionToken');
      return res.json({ success: true, message: 'Session closed successfully.' });
    } catch (error) {
      return res.status(500).json({ error: 'Logout execution processing broken.' });
    }
  }
};
