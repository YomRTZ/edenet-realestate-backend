const crypto = require("crypto");

/**
 * Input : a Buffer (e.g. from multer memoryStorage, fs.readFileSync, etc.)
 * Output: 64-char lowercase hex string
 */
function hashBuffer(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError("hashBuffer expects a Buffer, got: " + typeof buffer);
  }
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

module.exports = {
  hashBuffer,
};
