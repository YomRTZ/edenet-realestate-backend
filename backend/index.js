// index.js
// Application entry point.
// Loads env vars, validates required config, connects to the DB,
// starts the blockchain event listener, then boots Express.

require('dotenv').config();
const { validateEnv } = require('./src/config/env');
validateEnv();

const prisma = require('./src/config/db');
const createApp = require('./src/app');
const { startMarketplaceListener } = require('./src/utils/contract');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await prisma.$connect();
    console.log('[db] PostgreSQL connected');

    try {
      startMarketplaceListener(prisma);
    } catch (err) {
      console.warn('[chain] Marketplace listener failed to start (is your node running?):', err.message);
    }

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`[server] Running on http://localhost:${PORT}`);
      console.log('[routes] POST   /api/auth/register');
      console.log('[routes] POST   /api/auth/login');
      console.log('[routes] GET    /api/auth/me');
      console.log('[routes] POST   /api/kyc/upload');
      console.log('[routes] GET    /api/kyc/status');
      console.log('[routes] GET    /api/notifications');
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
      console.log('[routes] GET    /api/admin/analytics');
      console.log('[routes] GET    /api/verify/:tokenId');
      console.log('[routes] POST   /api/rentals/list/:propertyId');
      console.log('[routes] POST   /api/rentals/rent/:propertyId');
      console.log('[routes] POST   /api/rentals/pay/:propertyId');
      console.log('[routes] POST   /api/rentals/terminate/:propertyId');
      console.log('[routes] GET    /api/rentals/:propertyId');
    });
  } catch (err) {
    console.error('[startup error]', err);
    process.exit(1);
  }
}

start();
