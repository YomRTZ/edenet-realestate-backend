const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function authorizeSession(req: any, res: any, next: any) {
  // Read token sent inside HttpOnly cookie payload
  const token = req.cookies.sessionToken;
  if (!token) return res.status(401).json({ error: "Access denied. Active session token missing." });

  try {
    // 1. Decrypt & verify the structural integrity of the token string
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Perform database lookup to verify the session remains active and unrevoked
    const activeSession = await prisma.userSession.findUnique({
      where: { sessionToken: token },
      include: { user: true }
    });

    if (!activeSession || activeSession.expiresAt < new Date()) {
      return res.status(401).json({ error: "Session token has expired or been explicitly revoked." });
    }

    // Bind verified instance parameters straight onto execution thread context
    req.user = activeSession.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid cryptographic credentials provided." });
  }
}

module.exports = { authorizeSession };