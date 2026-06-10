// src/app.js
// Express app factory — exported so index.js can start it after DB connection.

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRouter         = require('./routes/auth');
const kycRouter          = require('./routes/kyc');
const notificationsRouter = require('./routes/notifications');
const propertiesRouter   = require('./routes/properties');
const adminRouter        = require('./routes/admin');
const verifyRouter       = require('./routes/verify');
const rentalsRouter      = require('./routes/rentals');

function createApp() {
  const app = express();

  // ── CORS ───────────────────────────────────────────────────────────────────
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS blocked: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'x-gov-wallet', 'Authorization'],
    })
  );

  // ── Body parsers ────────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Routes ──────────────────────────────────────────────────────────────────
  app.use('/api/auth',          authRouter);
  app.use('/api/kyc',           kycRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/properties',    propertiesRouter);
  app.use('/api/admin',         adminRouter);
  app.use('/api/verify',        verifyRouter);
  app.use('/api/rentals',       rentalsRouter);

  // ── Health check ───────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // ── 404 ────────────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
  });

  // ── Global error handler ───────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
