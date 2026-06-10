// routes/verify.js
// Public tamper-proof audit endpoint.
// Re-hashes the file from PostgreSQL and compares to what's on-chain.
// Anyone can call this — no auth required.

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { hashBuffer, hashMetadata, computeRootHash } = require("../utils/hash");
const { getOnChainHash, getOnChainVersionHistory } = require("../utils/contract");

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/verify/:tokenId
// Full tamper-proof audit for a property.
//
// Response:
// {
//   tokenId,
//   match: true/false,           ← is DB metadata hash == on-chain hash?
//   dbMetadataHash,              ← what PostgreSQL says
//   onChainHash,                 ← what the blockchain says
//   filesIntegrity: [            ← individual file checks
//     { fileName, storedHash, recomputedHash, match }
//   ],
//   imagesRootMatch: true/false, ← recomputed Merkle root matches stored
//   documentsRootMatch: true/false,
//   versionHistory: []           ← all versions from chain
// }
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:tokenId", async (req, res) => {
  const { tokenId } = req.params;

  try {
    // 1. Fetch property from DB
    const property = await prisma.property.findUnique({
      where: { tokenId },
      include: {
        metadataVersions: { orderBy: { versionNo: "asc" } },
      },
    });

    if (!property) {
      return res.status(404).json({ error: `No property found with tokenId: ${tokenId}` });
    }

    if (property.status !== "MINTED") {
      return res.status(400).json({ error: "Property is not yet minted — nothing on-chain to verify against" });
    }

    // 2. Fetch all files from DB (latest version)
    const latestVersion = await prisma.metadataVersion.findFirst({
      where: { propertyId: property.id },
      orderBy: { versionNo: "desc" },
    });

    const versionNo = latestVersion?.versionNo || 1;

    // Get latest available files — fall back to version 1 if no new files uploaded
    let images = await prisma.document.findMany({
      where: { propertyId: property.id, fileType: "IMAGE", versionNo },
    });
    if (images.length === 0) {
      images = await prisma.document.findMany({
        where: { propertyId: property.id, fileType: "IMAGE", versionNo: 1 },
      });
    }
    let documents = await prisma.document.findMany({
      where: { propertyId: property.id, fileType: "DOCUMENT", versionNo },
    });
    if (documents.length === 0) {
      documents = await prisma.document.findMany({
        where: { propertyId: property.id, fileType: "DOCUMENT", versionNo: 1 },
      });
    }

    // 3. Re-hash every file from its raw bytes and compare to stored hash
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

    // 4. Recompute root hashes from individual file hashes
    const recomputedImageHashes = images.map((f) => hashBuffer(f.fileData));
    const recomputedDocHashes = documents.map((f) => hashBuffer(f.fileData));

    const recomputedImagesRoot = computeRootHash(recomputedImageHashes);
    const recomputedDocsRoot = computeRootHash(recomputedDocHashes);

    const imagesRootMatch = recomputedImagesRoot === property.imagesRootHash;
    const documentsRootMatch = recomputedDocsRoot === property.documentsRootHash;

    // 5. Recompute metadata hash — use the saved snapshot for accuracy
    // The snapshot was saved at submission time with exact field values
    let recomputedMetadataHash;
    if (latestVersion?.metadataSnapshot) {
      // Use exact snapshot that was hashed at submission
      recomputedMetadataHash = hashMetadata(latestVersion.metadataSnapshot);
      console.log("[verify] using metadataSnapshot for recompute");
    } else {
      // Fallback: rebuild from property fields
      const metadataObj = {
        name:              property.name,
        location:          property.location,
        propertyType:      property.propertyType,
        bedrooms:          property.bedrooms,
        bathrooms:         property.bathrooms,
        squareFeet:        property.squareFeet,
        parking:           property.parking   || 0,
        floors:            property.floors    || 0,
        yearBuilt:         property.yearBuilt || 0,
        price:             property.price.toString(),
        description:       property.description || "",
        imagesRootHash:    property.imagesRootHash,
        documentsRootHash: property.documentsRootHash,
        version:           versionNo,
      };
      recomputedMetadataHash = hashMetadata(metadataObj);
      console.log("[verify] using rebuilt metadataObj for recompute");
    }
    console.log("[verify] recomputed:", recomputedMetadataHash);
    console.log("[verify] stored in DB:", property.metadataHash);

    // 6. Fetch on-chain hash
    let onChainHash = null;
    let chainError = null;
    try {
      onChainHash = await getOnChainHash(tokenId);
    } catch (err) {
      chainError = err.message;
    }

    //console.log("[verify] metadataObj used for recompute:", JSON.stringify(metadataObj));
    console.log("[verify] recomputed:", recomputedMetadataHash);
    console.log("[verify] stored in DB:", property.metadataHash);
    console.log("[verify] on-chain:", onChainHash);

    // 7. Fetch version history from chain
    let versionHistory = [];
    try {
      versionHistory = await getOnChainVersionHistory(tokenId);
    } catch (_) {}

    // 8. Final match: recomputed metadata hash vs on-chain hash
    const match = onChainHash ? recomputedMetadataHash === onChainHash : false;
    const allFilesMatch = filesIntegrity.every((f) => f.match);

    res.json({
      tokenId,
      propertyName: property.name,
      currentVersion: versionNo,

      // The main verdict
      tamperProof: match && allFilesMatch && imagesRootMatch && documentsRootMatch,

      // Hash comparison
      dbMetadataHash: property.metadataHash,
      recomputedMetadataHash,
      onChainHash,
      metadataHashMatch: recomputedMetadataHash === property.metadataHash,
      onChainMatch: match,

      // Root hash verification
      imagesRootHash: property.imagesRootHash,
      recomputedImagesRoot,
      imagesRootMatch,

      documentsRootHash: property.documentsRootHash,
      recomputedDocsRoot,
      documentsRootMatch,

      // Individual file integrity
      filesIntegrity,
      allFilesIntact: allFilesMatch,

      // Chain version history
      versionHistory,

      // DB metadata snapshots per version (for change detail / diffing in UI)
      metadataVersions: property.metadataVersions.map((v) => ({
        versionNo: v.versionNo,
        metadataHash: v.metadataHash,
        approvedAt: v.approvedAt,
        snapshot: v.metadataSnapshot,
      })),

      // Error info (if chain was unreachable)
      chainError: chainError || null,
    });
  } catch (err) {
    console.error("[GET /verify/:tokenId]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



