// src/config/env.js
// Validates required environment variables at startup.
// Import this at the very top of index.js before anything else.

const REQUIRED = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOV_WALLET',
  'GOV_PRIVATE_KEY',
  'RPC_URL',
  'PROPERTY_NFT_ADDRESS',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD',
];

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error('[config] Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

module.exports = { validateEnv };
