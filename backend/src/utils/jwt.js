// src/utils/jwt.js
// Single place that signs and verifies JWTs.
// Import this wherever a token needs to be generated — avoids duplicating
// the sign logic across authService and kycService.

const jwt = require('jsonwebtoken');

/**
 * Sign a JWT for the given user record.
 * @param {{ id: string, email: string, status: string, walletAddress: string|null }} user
 * @returns {string} signed JWT (7 day expiry)
 */
function generateToken(user) {
  return jwt.sign(
    {
      id:            user.id,
      email:         user.email,
      status:        user.status,
      walletAddress: user.walletAddress,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { generateToken };
