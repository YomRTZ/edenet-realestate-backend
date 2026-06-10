/**
 * src/utils/hash.test.js
 *
 * Run with:  node src/utils/hash.test.js
 * No test framework needed — plain Node.js assertions.
 */

const assert = require('assert');
const { hashBuffer, hashMetadata, computeRootHash, toBytes32 } = require('./hash');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ── hashBuffer ───────────────────────────────────────────────────────────────
console.log('\n── hashBuffer ──────────────────────────────────────────');

test('returns a 64-char hex string', () => {
  const hash = hashBuffer(Buffer.from('hello'));
  assert.strictEqual(typeof hash, 'string');
  assert.strictEqual(hash.length, 64);
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test("known SHA-256 of 'hello'", () => {
  assert.strictEqual(
    hashBuffer(Buffer.from('hello')),
    '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
  );
});

test('same buffer always produces same hash', () => {
  const buf = Buffer.from('realestate_doc_content_123');
  assert.strictEqual(hashBuffer(buf), hashBuffer(buf));
});

test('different buffers produce different hashes', () => {
  assert.notStrictEqual(hashBuffer(Buffer.from('doc1')), hashBuffer(Buffer.from('doc2')));
});

test('throws on non-Buffer input', () => {
  assert.throws(() => hashBuffer('not a buffer'), TypeError);
});

// ── hashMetadata ─────────────────────────────────────────────────────────────
console.log('\n── hashMetadata ────────────────────────────────────────');

const sampleMeta = {
  tokenId: '42', name: 'Sunrise Villa', location: 'Addis Ababa, Bole',
  propertyType: 'Residential', bedrooms: 3, bathrooms: 2,
  squareFeet: 1800, price: '250000000000000000', version: 1,
};

test('returns a 64-char hex string', () => {
  assert.match(hashMetadata(sampleMeta), /^[0-9a-f]{64}$/);
});

test('key order does NOT affect the hash (deterministic)', () => {
  const shuffled = {
    version: 1, name: 'Sunrise Villa', tokenId: '42', price: '250000000000000000',
    bedrooms: 3, location: 'Addis Ababa, Bole', bathrooms: 2,
    squareFeet: 1800, propertyType: 'Residential',
  };
  assert.strictEqual(hashMetadata(sampleMeta), hashMetadata(shuffled));
});

test('changing a field changes the hash', () => {
  assert.notStrictEqual(hashMetadata(sampleMeta), hashMetadata({ ...sampleMeta, bedrooms: 4 }));
});

test('throws on null input', () => {
  assert.throws(() => hashMetadata(null), TypeError);
});

// ── computeRootHash ──────────────────────────────────────────────────────────
console.log('\n── computeRootHash ─────────────────────────────────────');

const h1 = hashBuffer(Buffer.from('image1'));
const h2 = hashBuffer(Buffer.from('image2'));
const h3 = hashBuffer(Buffer.from('image3'));

test('single element → returns that element unchanged', () => {
  assert.strictEqual(computeRootHash([h1]), h1);
});

test('empty array → returns hash of empty string', () => {
  const emptyHash = require('crypto').createHash('sha256').update('').digest('hex');
  assert.strictEqual(computeRootHash([]), emptyHash);
});

test('returns 64-char hex for 2 elements', () => {
  assert.match(computeRootHash([h1, h2]), /^[0-9a-f]{64}$/);
});

test('returns 64-char hex for 3 elements (odd — tests padding)', () => {
  assert.match(computeRootHash([h1, h2, h3]), /^[0-9a-f]{64}$/);
});

test('same set → same root (deterministic)', () => {
  assert.strictEqual(computeRootHash([h1, h2, h3]), computeRootHash([h1, h2, h3]));
});

test('different order → different root', () => {
  assert.notStrictEqual(computeRootHash([h1, h2]), computeRootHash([h2, h1]));
});

test('throws on invalid hash in array', () => {
  assert.throws(() => computeRootHash(['not_a_hash']), TypeError);
});

// ── toBytes32 ────────────────────────────────────────────────────────────────
console.log('\n── toBytes32 ───────────────────────────────────────────');

test('prepends 0x to a valid hash', () => {
  const hash = hashBuffer(Buffer.from('test'));
  assert.strictEqual(toBytes32(hash), '0x' + hash);
});

test('throws on non-hex input', () => {
  assert.throws(() => toBytes32('not_valid'), TypeError);
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n────────────────────────────────────────────────────────');
console.log(`  Results: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
