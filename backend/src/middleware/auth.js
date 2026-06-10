// src/middleware/auth.js
// Verifies the Bearer JWT and attaches req.user = { id, email, status, walletAddress, role }.

const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, status: true, walletAddress: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const govWallet = (process.env.GOV_WALLET || '').toLowerCase();
    const role =
      user.walletAddress
        ? user.walletAddress.toLowerCase() === govWallet
          ? 'GOVERNMENT'
          : 'CITIZEN'
        : null;

    req.user = { ...user, role };
    next();
  } catch (err) {
    console.error('[auth middleware]', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = auth;
