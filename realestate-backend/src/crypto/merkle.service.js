const crypto = require("crypto");

/**
 * Input : array of 64-char hex strings (individual file hashes)
 * Output: 64-char hex string root
 */
function computeRootHash(hexHashArray) {
  if (!Array.isArray(hexHashArray)) {
    throw new TypeError("computeRootHash expects an array of hex strings");
  }

  hexHashArray.forEach((h, i) => {
    if (typeof h !== "string" || !/^[0-9a-f]{64}$/i.test(h)) {
      throw new TypeError(
        `computeRootHash: element at index ${i} is not a valid 64-char hex hash`
      );
    }
  });

  if (hexHashArray.length === 0) {
    return crypto.createHash("sha256").update("").digest("hex");
  }

  if (hexHashArray.length === 1) {
    return hexHashArray[0];
;  }

  let level = [...hexHashArray];

  while (level.length > 1) {
    if (level.length % 2 !== 0) {
      level.push(level[level.length - 1]);
    }

    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const combined = level[i] + level[i + 1]; 
      const parent = crypto
        .createHash("sha256")
        .update(combined, "hex")        
        .digest("hex");
      nextLevel.push(parent);
    }
    level = nextLevel;
  }

  return level[0];
}

/**
 * Converts a 64-char hex hash to an ethers.js-compatible bytes32 string.
 */
function toBytes32(hexHash) {
  if (typeof hexHash !== "string" || !/^[0-9a-f]{64}$/i.test(hexHash)) {
    throw new TypeError("toBytes32 expects a 64-char hex string");
  }
  return "0x" + hexHash.toLowerCase();
}

module.exports = {
  computeRootHash,
  toBytes32,
};
