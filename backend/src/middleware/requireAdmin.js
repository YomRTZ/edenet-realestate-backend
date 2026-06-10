// src/middleware/requireAdmin.js
// Ensures the authenticated user is the government wallet.
// Must be used after (or instead of) the auth middleware — it runs auth internally.

const auth = require('./auth');

function requireAdmin(req, res, next) {
  auth(req, res, (err) => {
    if (err) return; // auth already sent a response

    if (!req.user.walletAddress) {
      return res.status(403).json({
        error: 'Government wallet required',
        message: 'You must connect a government wallet to access this resource',
      });
    }

    const govWallet = (process.env.GOV_WALLET || '').toLowerCase();
    if (req.user.walletAddress.toLowerCase() !== govWallet) {
      return res.status(403).json({
        error: 'Government wallet required',
        message: 'Only government administrators can access this resource',
      });
    }

    next();
  });
}

module.exports = requireAdmin;
