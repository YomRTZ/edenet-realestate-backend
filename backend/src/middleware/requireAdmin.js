// Verifies the already-authenticated user is the government wallet.
// MUST be used AFTER the auth middleware — it relies on req.user being set.
// Using it standalone (without auth first) will throw because req.user is undefined.

function requireAdmin(req, res, next) {
  // auth middleware guarantees req.user exists — but guard defensively
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.walletAddress) {
    return res.status(403).json({
      error: 'Government wallet required',
      message: 'You must connect a government wallet to access this resource',
    });
  }

  const govWallet = (process.env.GOV_WALLET || '').toLowerCase();
  if (req.user.walletAddress.toLowerCase() !== govWallet) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only government administrators can access this resource',
    });
  }

  next();
}

module.exports = requireAdmin;
