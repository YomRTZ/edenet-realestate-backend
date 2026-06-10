const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to req.user
 */
async function auth(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        status: true,
        walletAddress: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Determine role based on wallet address
    let role = null;
    if (user.walletAddress) {
      const govWallet = process.env.GOV_WALLET.toLowerCase();
      const userWallet = user.walletAddress.toLowerCase();
      role = userWallet === govWallet ? 'GOVERNMENT' : 'CITIZEN';
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      status: user.status,
      walletAddress: user.walletAddress,
      role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = auth;
