import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser'; // 1. CRITICAL IMPORT: Added cookie parsing engine
import { fileURLToPath } from 'url';
import { uploadsRouter } from './routes/uploads.js';
import authRouter from './routes/auth.routes.js';
import fs from 'fs';
import { subscribeToRentalEvents } from './blockchain/rental.listener.js';

const app = express();

// 2. CRITICAL CHANGE: Explicit CORS rules for secure cookie exchanges
// Accept the client URL from env or allow the local dev port used by Vite (5173)
const defaultClient = 'http://localhost:3000';
const viteClient = 'http://localhost:5173';
const clientUrl = process.env.CLIENT_URL || defaultClient;
const corsWhitelist = [clientUrl, viteClient];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server or some tools)
    if (!origin) return callback(null, true);
    if (corsWhitelist.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Allow the Cookie header so browsers can send httpOnly session cookies
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser()); // 3. CRITICAL CHANGE: Placed middleware here to unpack cookies into req.cookies

// Serve uploaded files statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/uploads', uploadsRouter);
app.use('/api/auth', authRouter);

// Global error handler to ensure stack traces are logged for unexpected errors
app.use((err, req, res, next) => {
  console.error('Unhandled error middleware:', err && (err.stack || err));
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && (err.stack || err));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason && (reason.stack || reason));
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Application server running on http://localhost:${PORT}`);

  // Optional: wire rental contract event listener when env vars are present
  const rentalAddress = process.env.RENTAL_CONTRACT_ADDRESS;
  const rentalAbiPath = process.env.RENTAL_CONTRACT_ABI_PATH; // path to compiled ABI JSON
  const providerUrl = process.env.PROVIDER_URL || 'http://127.0.0.1:8545';

  if (rentalAddress && rentalAbiPath) {
    try {
      const raw = fs.readFileSync(rentalAbiPath, 'utf8');
      const abiJson = JSON.parse(raw);
      subscribeToRentalEvents(providerUrl, rentalAddress, abiJson);
      console.log('Rental listener attached for', rentalAddress);
    } catch (err) {
      console.warn('Could not attach rental listener:', err && (err.message || err));
    }
  } else {
    console.log('Rental listener not attached — set RENTAL_CONTRACT_ADDRESS and RENTAL_CONTRACT_ABI_PATH to enable.');
  }
});
