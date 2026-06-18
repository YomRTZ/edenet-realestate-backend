const crypto = require("crypto");

/**
 * JSON.stringify replacer that sorts object keys alphabetically.
 * Ensures consistent hashes regardless of object key order.
 */
function sortedReplacer(key, value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
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
 * Input : a plain JS object (the property metadata)
 * Output: 64-char lowercase hex string
 */
function hashMetadata(metadataObject) {
  if (typeof metadataObject !== "object" || metadataObject === null) {
    throw new TypeError("hashMetadata expects a plain object");
  }
  
  const canonical = JSON.stringify(metadataObject, sortedReplacer);
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

module.exports = {
  hashMetadata,
};
