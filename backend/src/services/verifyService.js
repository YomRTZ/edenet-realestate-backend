// src/services/verifyService.js
// Tamper-proof audit: re-hashes files from DB and compares to on-chain hash.

const prisma = require('../config/db');
const { hashBuffer, hashMetadata, computeRootHash } = require('../utils/hash');
const { getOnChainHash, getOnChainVersionHistory } = require('../utils/contract');

async function verifyProperty(tokenId) {
  const property = await prisma.property.findUnique({
    where: { tokenId },
    include: { metadataVersions: { orderBy: { versionNo: 'asc' } } },
  });

  if (!property) throw Object.assign(new Error(`No property found with tokenId: ${tokenId}`), { status: 404 });
  if (property.status !== 'MINTED') {
    throw Object.assign(new Error('Property is not yet minted — nothing on-chain to verify against'), { status: 400 });
  }

  // Latest version number
  const latestVersion = await prisma.metadataVersion.findFirst({
    where: { propertyId: property.id },
    orderBy: { versionNo: 'desc' },
  });
  const versionNo = latestVersion?.versionNo || 1;

  // Fetch files — fall back to version 1 if none exist for the latest
  let images = await prisma.document.findMany({ where: { propertyId: property.id, fileType: 'IMAGE', versionNo } });
  if (images.length === 0) images = await prisma.document.findMany({ where: { propertyId: property.id, fileType: 'IMAGE', versionNo: 1 } });

  let documents = await prisma.document.findMany({ where: { propertyId: property.id, fileType: 'DOCUMENT', versionNo } });
  if (documents.length === 0) documents = await prisma.document.findMany({ where: { propertyId: property.id, fileType: 'DOCUMENT', versionNo: 1 } });

  // Re-hash every file and compare to stored hash
  const filesIntegrity = [];
  for (const file of [...images, ...documents]) {
    const recomputed = hashBuffer(file.fileData);
    filesIntegrity.push({
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      storedHash: file.sha256Hash,
      recomputedHash: recomputed,
      match: recomputed === file.sha256Hash,
    });
  }

  // Recompute Merkle roots
  const recomputedImagesRoot = computeRootHash(images.map((f) => hashBuffer(f.fileData)));
  const recomputedDocsRoot = computeRootHash(documents.map((f) => hashBuffer(f.fileData)));
  const imagesRootMatch = recomputedImagesRoot === property.imagesRootHash;
  const documentsRootMatch = recomputedDocsRoot === property.documentsRootHash;

  // Recompute metadata hash from saved snapshot or property fields
  let recomputedMetadataHash;
  if (latestVersion?.metadataSnapshot) {
    recomputedMetadataHash = hashMetadata(latestVersion.metadataSnapshot);
  } else {
    recomputedMetadataHash = hashMetadata({
      name: property.name, location: property.location, propertyType: property.propertyType,
      bedrooms: property.bedrooms, bathrooms: property.bathrooms, squareFeet: property.squareFeet,
      parking: property.parking || 0, floors: property.floors || 0, yearBuilt: property.yearBuilt || 0,
      price: property.price.toString(), description: property.description || '',
      imagesRootHash: property.imagesRootHash, documentsRootHash: property.documentsRootHash,
      version: versionNo,
    });
  }

  // Fetch on-chain hash
  let onChainHash = null;
  let chainError = null;
  try {
    onChainHash = await getOnChainHash(tokenId);
  } catch (err) {
    chainError = err.message;
  }

  // Version history from chain
  let versionHistory = [];
  try {
    versionHistory = await getOnChainVersionHistory(tokenId);
  } catch (_) {}

  const match = onChainHash ? recomputedMetadataHash === onChainHash : false;
  const allFilesMatch = filesIntegrity.every((f) => f.match);

  return {
    tokenId,
    propertyName: property.name,
    currentVersion: versionNo,
    tamperProof: match && allFilesMatch && imagesRootMatch && documentsRootMatch,
    dbMetadataHash: property.metadataHash,
    recomputedMetadataHash,
    onChainHash,
    metadataHashMatch: recomputedMetadataHash === property.metadataHash,
    onChainMatch: match,
    imagesRootHash: property.imagesRootHash,
    recomputedImagesRoot,
    imagesRootMatch,
    documentsRootHash: property.documentsRootHash,
    recomputedDocsRoot,
    documentsRootMatch,
    filesIntegrity,
    allFilesIntact: allFilesMatch,
    versionHistory,
    metadataVersions: property.metadataVersions.map((v) => ({
      versionNo: v.versionNo,
      metadataHash: v.metadataHash,
      approvedAt: v.approvedAt,
      snapshot: v.metadataSnapshot,
    })),
    chainError: chainError || null,
  };
}

module.exports = { verifyProperty };
