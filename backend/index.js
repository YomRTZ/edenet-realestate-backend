// index.js
// Application entry point.
// Order: load env → validate → connect DB → start chain listener → boot Express.

require('dotenv').config();
const { validateEnv } = require('./src/config/env');
validateEnv();

const prisma    = require('./src/config/db');
const createApp = require('./src/app');
const { startMarketplaceListener } = require('./src/utils/contract');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // ── Database ──────────────────────────────────────────────────────────────
    await prisma.$connect();
    console.log('[db]     PostgreSQL connected');

    // ── Blockchain event listener ─────────────────────────────────────────────
    // Non-fatal: if the local Hardhat node isn't running yet the server still starts.
    // The listener catches its own async errors internally.
    try {
      startMarketplaceListener(prisma);
    } catch (err) {
      console.warn('[chain]  Listener failed to start (node running?):', err.message);
    }

    // ── Express ───────────────────────────────────────────────────────────────
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`\n[server] Running on http://localhost:${PORT}\n`);
      console.log('[routes] POST   /api/auth/register');
      console.log('[routes] POST   /api/auth/google');
      console.log('[routes] POST   /api/auth/verify-otp');
      console.log('[routes] POST   /api/auth/resend-otp');
      console.log('[routes] POST   /api/auth/login');
      console.log('[routes] POST   /api/auth/connect-wallet');
      console.log('[routes] POST   /api/auth/disconnect-wallet');
      console.log('[routes] GET    /api/auth/me');
      console.log('[routes] POST   /api/kyc/upload');
      console.log('[routes] GET    /api/kyc/status');
      console.log('[routes] GET    /api/notifications');
      console.log('[routes] POST   /api/notifications/:id/read');
      console.log('[routes] POST   /api/notifications/read-all');
      console.log('[routes] DELETE /api/notifications/:id');
      console.log('[routes] POST   /api/properties/request/prepare');
      console.log('[routes] POST   /api/properties/request/confirm');
      console.log('[routes] GET    /api/properties');
      console.log('[routes] GET    /api/properties/:id');
      console.log('[routes] GET    /api/properties/:id/images');
      console.log('[routes] GET    /api/properties/:id/documents');
      console.log('[routes] POST   /api/properties/:id/update-request');
      console.log('[routes] GET    /api/admin/requests');
      console.log('[routes] POST   /api/admin/approve/:requestId');
      console.log('[routes] POST   /api/admin/decline/:requestId');
      console.log('[routes] GET    /api/admin/users');
      console.log('[routes] GET    /api/admin/kyc/pending');
      console.log('[routes] GET    /api/admin/kyc/:userId/documents/:docId');
      console.log('[routes] POST   /api/admin/kyc/:userId/approve');
      console.log('[routes] POST   /api/admin/kyc/:userId/reject');
      console.log('[routes] GET    /api/admin/analytics');
      console.log('[routes] GET    /api/verify/:tokenId');
      console.log('[routes] POST   /api/rentals/list/:propertyId');
      console.log('[routes] POST   /api/rentals/unlist/:propertyId');
      console.log('[routes] POST   /api/rentals/rent/:propertyId');
      console.log('[routes] POST   /api/rentals/pay/:propertyId');
      console.log('[routes] POST   /api/rentals/terminate/:propertyId');
      console.log('[routes] POST   /api/rentals/finalize/:propertyId');
      console.log('[routes] GET    /api/rentals/history/:propertyId');
      console.log('[routes] GET    /api/rentals/tenant/:wallet');
      console.log('[routes] GET    /api/rentals/landlord/:wallet');
      console.log('[routes] GET    /api/rentals/:propertyId');
      console.log('[routes] GET    /api/health');
    });
  } catch (err) {
    console.error('[startup] Fatal error:', err);
    process.exit(1);
  }
}

start();
