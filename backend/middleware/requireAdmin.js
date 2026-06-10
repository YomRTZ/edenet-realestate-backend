const auth = require('./auth');

/**
 * Middleware to check if user is a government admin
 * Automatically includes auth middleware
 */
function requireAdmin(req, res, next) {
  // First run auth middleware
  auth(req, res, (err) => {
    if (err) return;

    // Check if user has government wallet
    if (!req.user.walletAddress) {
      return res.status(403).json({ 
        error: 'Government wallet required',
        message: 'You must connect a government wallet to access this resource'
      });
    }

    const govWallet = process.env.GOV_WALLET.toLowerCase();
    const userWallet = req.user.walletAddress.toLowerCase();

    if (userWallet !== govWallet) {
      return res.status(403).json({ 
        error: 'Government wallet required',
        message: 'Only government administrators can access this resource'
      });
    }

    next();
  });
}

module.exports = requireAdmin;
