import { authService } from '../services/auth.service.js';

const buildCookieOptions = (req) => {
  const isSecure =
    req.secure || req.headers['x-forwarded-proto'] === 'https';

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    path: '/',
  };
};

export const authController = {
  async getNonce(req, res) {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          error: 'Wallet address required.',
        });
      }

      const nonce = await authService.generateNonce(walletAddress);

      return res.json({ nonce });
    } catch (error) {
      console.error('getNonce error:', error);

      return res.status(500).json({
        error: 'Failed to generate nonce.',
      });
    }
  },

  async login(req, res) {
    try {
      const { walletAddress, signature } = req.body;

      if (!walletAddress || !signature) {
        return res.status(400).json({
          error: 'Wallet address and signature are required.',
        });
      }

      const {
        user,
        sessionToken,
        refreshToken,
        sessionExpiry,
        refreshTokenExpiry,
      } = await authService.verifyLogin(walletAddress, signature);

      const cookieOptions = buildCookieOptions(req);

      res.cookie('sessionToken', sessionToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        account: user.walletAddress,
        role: user.role,
        isOwner: user.isOwner,
        isTenant: user.isTenant,
        sessionExpiry,
        refreshTokenExpiry,
      });
    } catch (error) {
      console.error('login error:', error);

      return res.status(401).json({
        error: error.message || 'Authentication failed.',
      });
    }
  },

  async refresh(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          error: 'Refresh token missing.',
        });
      }

      const {
        user,
        sessionToken,
        refreshToken: newRefreshToken,
        sessionExpiry,
        refreshTokenExpiry,
      } = await authService.refreshToken(refreshToken);

      const cookieOptions = buildCookieOptions(req);

      res.cookie('sessionToken', sessionToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        account: user.walletAddress,
        role: user.role,
        isOwner: user.isOwner,
        isTenant: user.isTenant,
        sessionExpiry,
        refreshTokenExpiry,
      });
    } catch (error) {
      console.error('refresh error:', error);

      return res.status(401).json({
        error: error.message || 'Refresh failed.',
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { action } = req.body;

      const updatedUser = await authService.updateCitizenStatus(
        req.user.id,
        action
      );

      return res.json({
        isOwner: updatedUser.isOwner,
        isTenant: updatedUser.isTenant,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Failed to update status.',
      });
    }
  },

  async logout(req, res) {
    try {
      const token = req.cookies?.sessionToken;

      await authService.logout(token);

      const cookieOptions = buildCookieOptions(req);

      res.clearCookie('sessionToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Logout failed.',
      });
    }
  },
};