/**
 * src/utils/hash.js
 *
 * SHA-256 hashing utilities for the hybrid Web2 + Web3 real estate system.
 *
 * Exports:
 *   hashBuffer(buffer)              → 64-char hex string  (for raw files)
 *   hashMetadata(metadataObject)    → 64-char hex string  (for JSON metadata)
 *   computeRootHash(hexHashArray)   → 64-char hex string  (Merkle-style root over an array of hashes)
 *   toBytes32(hexHash)              → 0x-prefixed bytes32 string for on-chain calls
 */

const crypto = require('crypto');

/**
 * SHA-256 hash of a raw file buffer.
 * @param {Buffer} buffer
 * @returns {string} 64-char lowercase hex
 */
function hashBuffer(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('hashBuffer expects a Buffer, got: ' + typeof buffer);
  }
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Deterministic SHA-256 hash of a metadata object.
 * Keys are sorted before serialization so key order never affects the output.
 * @param {object} metadataObject
 * @returns {string} 64-char lowercase hex
 */
function hashMetadata(metadataObject) {
  if (typeof metadataObject !== 'object' || metadataObject === null) {
    throw new TypeError('hashMetadata expects a plain object');
  }
  const canonical = JSON.stringify(metadataObject, sortedReplacer);
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/** JSON.stringify replacer that sorts object keys alphabetically */
function sortedReplacer(key, value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value)
      .sort()
      .reduce((sorted, k) => {
        sorted[k] = value[k];
        return sorted;
      }, {});
  }
  return value;
}

/**
 * Binary Merkle root over an array of 64-char hex hashes.
 * Empty array → hash of empty string.
 * Single element → that element is the root.
 * Odd-length levels are padded by duplicating the last element.
 * @param {string[]} hexHashArray
 * @returns {string} 64-char lowercase hex
 */
function computeRootHash(hexHashArray) {
  if (!Array.isArray(hexHashArray)) {
    throw new TypeError('computeRootHash expects an array of hex strings');
  }

  hexHashArray.forEach((h, i) => {
    if (typeof h !== 'string' || !/^[0-9a-f]{64}$/i.test(h)) {
      throw new TypeError(
        `computeRootHash: element at index ${i} is not a valid 64-char hex hash`
      );
    }
  });

  if (hexHashArray.length === 0) {
    return crypto.createHash('sha256').update('').digest('hex');
  }

  if (hexHashArray.length === 1) {
    return hexHashArray[0];
  }

  let level = [...hexHashArray];
  while (level.length > 1) {
    if (level.length % 2 !== 0) level.push(level[level.length - 1]);
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const combined = level[i] + level[i + 1];
      nextLevel.push(
        crypto.createHash('sha256').update(combined, 'hex').digest('hex')
      );
    }
    level = nextLevel;
  }

  return level[0];
}

/**
 * Convert a 64-char hex hash to an ethers-compatible bytes32 string.
 * @param {string} hexHash
 * @returns {string} 0x-prefixed 66-char string
 */
function toBytes32(hexHash) {
  if (typeof hexHash !== 'string' || !/^[0-9a-f]{64}$/i.test(hexHash)) {
    throw new TypeError('toBytes32 expects a 64-char hex string');
  }
  return '0x' + hexHash.toLowerCase();
}

module.exports = { hashBuffer, hashMetadata, computeRootHash, toBytes32 };
