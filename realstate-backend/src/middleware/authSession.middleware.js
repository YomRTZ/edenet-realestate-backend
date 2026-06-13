import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const { PrismaClient } = pkg;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

export async function authorizeSession(req, res, next) {
  const token = req.cookies && req.cookies.sessionToken;
  if (!token) return res.status(401).json({ error: 'Access denied. Active session token missing.' });

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    const activeSession = await prisma.userSession.findUnique({
      where: { sessionToken: token },
      include: { user: true }
    });

    if (!activeSession || activeSession.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Session token has expired or been explicitly revoked.' });
    }

    req.user = activeSession.user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid cryptographic credentials provided.' });
  }
}
