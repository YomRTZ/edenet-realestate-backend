// src/config/env.js
// Validates that all required environment variables are set at startup.
// Import this at the top of index.js before anything else.

const REQUIRED = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOV_WALLET',
  'GOV_PRIVATE_KEY',
  'RPC_URL',
  'PROPERTY_NFT_ADDRESS',
  'MARKETPLACE_ADDRESS',
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
