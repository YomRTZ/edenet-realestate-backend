import prisma from '../prisma/prismaClient.js';
import { inMemorySessionsByToken } from '../services/inMemoryStore.js';

export async function validateSession(req, res, next) {
  const sessionToken = req.cookies?.sessionToken;

  if (!sessionToken) {
    return res.status(401).json({
      error: 'Session token missing.',
    });
  }

  try {
    const session = await prisma.userSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (session) {
      if (session.expiresAt < new Date()) {
        return res.status(401).json({
          error: 'Session expired.',
        });
      }

      req.session = session;
      req.user = session.user;

      return next();
    }

    const memSession = inMemorySessionsByToken.get(sessionToken);

    if (!memSession) {
      return res.status(401).json({
        error: 'Invalid session.',
      });
    }

    if (memSession.sessionExpiry < new Date()) {
      inMemorySessionsByToken.delete(sessionToken);

      return res.status(401).json({
        error: 'Session expired.',
      });
    }

    req.session = memSession;
    req.user = memSession.user;

    return next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Session validation failed.',
    });
  }
}

export async function optionalSession(req, res, next) {
  const sessionToken = req.cookies?.sessionToken;

  if (!sessionToken) {
    return next();
  }

  try {
    const session = await prisma.userSession.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (session && session.expiresAt > new Date()) {
      req.session = session;
      req.user = session.user;
    }

    return next();
  } catch (error) {
    console.error(error);
    return next();
  }
}