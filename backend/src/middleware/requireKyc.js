// Ensures the authenticated user has passed KYC (status === 'ACTIVE').
// Must be used after auth middleware.

function requireKyc(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.status !== 'ACTIVE') {
    return res.status(403).json({
      error: 'KYC approval required',
      currentStatus: req.user.status,
      message: 'You must complete KYC verification before accessing this resource',
    });
  }

  next();
}

module.exports = requireKyc;
