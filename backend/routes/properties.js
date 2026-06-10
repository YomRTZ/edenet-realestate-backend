// routes/properties.js
// Citizen-facing routes: submit mint request, submit update request, fetch properties/files

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { uploadPropertyFiles } = require("../middleware/upload");
const { hashBuffer, hashMetadata, computeRootHash } = require("../utils/hash");
const auth = require("../middleware/auth");
const requireKyc = require("../middleware/requireKyc");
const { notifyAdmin } = require("../utils/notifications");

const prisma = new PrismaClient();

// Temporary in-memory store for uploaded files awaiting chain confirmation
// In production replace with Redis
const pendingUploads = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of pendingUploads.entries()) {
    if (val.expiresAt < now) pendingUploads.delete(key);
  }
}, 5 * 60 * 1000);

// ─────────────────────────────────────────────────────────────────────────────
// Helper: process uploaded files, hash them, save to DB
// Returns { savedDocs, imageHashes, docHashes }
// ─────────────────────────────────────────────────────────────────────────────
async function processAndSaveFiles(files, propertyId, uploaderWallet, versionNo = 1) {
  const images = files.images || [];
  const documents = files.documents || [];

  const imageHashes = [];
  const docHashes = [];
  const savedDocs = [];

  // Process images
  for (const file of images) {
    const hash = hashBuffer(file.buffer);
    imageHashes.push(hash);

    const doc = await prisma.document.create({
      data: {
        propertyId,
        fileData: file.buffer,
        sha256Hash: hash,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileType: "IMAGE",
        docType: "photo",
        versionNo,
        sizeBytes: file.size,
        uploadedBy: uploaderWallet.toLowerCase(),
      },
    });
    savedDocs.push(doc);
  }

  // Process documents
  for (const file of documents) {
    const hash = hashBuffer(file.buffer);
    docHashes.push(hash);

    const doc = await prisma.document.create({
      data: {
        propertyId,
        fileData: file.buffer,
        sha256Hash: hash,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileType: "DOCUMENT",
        docType: "deed", // frontend can pass this as a field later
        versionNo,
        sizeBytes: file.size,
        uploadedBy: uploaderWallet.toLowerCase(),
      },
    });
    savedDocs.push(doc);
  }

  return { savedDocs, imageHashes, docHashes };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/properties/request
// Citizen submits a new mint request with files + metadata
//
// FormData fields:
//   wallet        (string)  — citizen's wallet address
//   name          (string)
//   location      (string)
//   propertyType  (string)
//   bedrooms      (number)
//   bathrooms     (number)
//   squareFeet    (number)
//   price         (string)  — in wei
//   description   (string, optional)
//   images[]      (files)
//   documents[]   (files)
// ─────────────────────────────────────────────────────────────────────────────
// Route 1: Upload files, compute hashes, store temporarily — NO DB write
// Returns hashes for the frontend to use in the contract call
router.post("/request/prepare", auth, requireKyc, uploadPropertyFiles, async (req, res) => {
  try {
    const { wallet, name, location, propertyType,
            bedrooms, bathrooms, sqft, parking,
            floors, yearBuilt, price, description } = req.body;
    console.log("req.body received:", req.body);

    if (!wallet || !name || !location || !propertyType || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash files but don't save to DB yet
    const images = req.files?.images || [];
    const documents = req.files?.documents || [];

    const imageHashes = images.map(f => hashBuffer(f.buffer));
    const docHashes = documents.map(f => hashBuffer(f.buffer));

    const imagesRootHash = computeRootHash(imageHashes);
    const documentsRootHash = computeRootHash(docHashes);

    const metadataObj = {
      name,
      location,
      propertyType,
      bedrooms:     parseInt(bedrooms)  || 0,
      bathrooms:    parseInt(bathrooms) || 0,
      squareFeet:   parseInt(sqft)      || 0,  // sqft from form → squareFeet in DB
      parking:      parseInt(parking)   || 0,
      floors:       parseInt(floors)    || 0,
      yearBuilt:    parseInt(yearBuilt) || 0,
      price:        price.toString(),           // keep as string, no conversion
      description:  description || "",
      imagesRootHash,
      documentsRootHash,
      version: 1,
    };
    const metadataHash = hashMetadata(metadataObj);

    // Store files temporarily in memory cache with a tempId
    // We use a simple in-memory map — lives until /confirm is called
    const tempId = require("crypto").randomUUID();
    pendingUploads.set(tempId, {
      wallet, metadataObj, metadataHash,
      imagesRootHash, documentsRootHash,
      imageFiles: images, docFiles: documents,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min TTL
    });

    res.status(200).json({
      tempId,
      hashes: { metadataHash, imagesRootHash, documentsRootHash },
    });
  } catch (err) {
    console.error("[POST /properties/request/prepare]", err);
    res.status(500).json({ error: err.message });
  }
});

// Route 2: Called after MetaMask confirms — write everything to DB
router.post("/request/confirm", auth, requireKyc, async (req, res) => {
  try {
    const { tempId, txHash } = req.body;
    if (!tempId || !txHash) {
      return res.status(400).json({ error: "tempId and txHash are required" });
    }

    const pending = pendingUploads.get(tempId);
    if (!pending) {
      return res.status(404).json({ error: "No pending upload found — may have expired (10 min limit)" });
    }

    pendingUploads.delete(tempId); // consume it

    const { wallet, metadataObj, metadataHash,
            imagesRootHash, documentsRootHash,
            imageFiles, docFiles } = pending;

    // NOW write to DB
    const property = await prisma.property.create({
      data: {
        tokenId:      `pending_${Date.now()}`,
        ownerWallet:  wallet.toLowerCase(),
        status:       "PENDING",
        name:         metadataObj.name,
        location:     metadataObj.location,
        propertyType: metadataObj.propertyType,
        bedrooms:     metadataObj.bedrooms,
        bathrooms:    metadataObj.bathrooms,
        squareFeet:   metadataObj.squareFeet || 0,
        parking:      metadataObj.parking   || 0,
        floors:       metadataObj.floors    || 0,
        yearBuilt:    metadataObj.yearBuilt || 0,
        price:        metadataObj.price ? metadataObj.price.toString() : "0",
        description:  metadataObj.description || null,
        metadataHash, imagesRootHash, documentsRootHash,
      },
    });

    // Save files
    const savedDocs = [];
    for (const file of imageFiles) {
      const hash = hashBuffer(file.buffer);
      const doc = await prisma.document.create({
        data: {
          propertyId: property.id,
          fileData:   file.buffer,
          sha256Hash: hash,
          fileName:   file.originalname,
          mimeType:   file.mimetype,
          fileType:   "IMAGE",
          docType:    "photo",
          versionNo:  1,
          sizeBytes:  file.size,
          uploadedBy: wallet.toLowerCase(),
        },
      });
      savedDocs.push(doc);
    }
    for (const file of docFiles) {
      const hash = hashBuffer(file.buffer);
      const doc = await prisma.document.create({
        data: {
          propertyId: property.id,
          fileData:   file.buffer,
          sha256Hash: hash,
          fileName:   file.originalname,
          mimeType:   file.mimetype,
          fileType:   "DOCUMENT",
          docType:    "deed",
          versionNo:  1,
          sizeBytes:  file.size,
          uploadedBy: wallet.toLowerCase(),
        },
      });
      savedDocs.push(doc);
    }

    // Create request record
    const request = await prisma.request.create({
      data: {
        propertyId:       property.id,
        type:             "MINT",
        status:           "PENDING",
        metadataHash,
        imagesRootHash,
        documentsRootHash,
        metadataSnapshot: metadataObj,
        submittedBy:      wallet.toLowerCase(),
          documentIds:      savedDocs.map(d => d.id),
        },
      });

      notifyAdmin('PROPERTY_SUBMITTED', 'New property submission', `${metadataObj.name || 'A property'} was submitted for review.`, '/dashboard/property-approvals');
      res.status(201).json({
        message:    "Property request confirmed and saved",
        requestId:  request.id,
        propertyId: property.id,
        txHash,
      });
    } catch (err) {
    console.error("[POST /properties/request/confirm]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/properties/:id/update-request
// Citizen submits a metadata update request for an existing property
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/update-request", auth, requireKyc, uploadPropertyFiles, async (req, res) => {
  try {
    const { id } = req.params;
    const { wallet, name, location, propertyType, bedrooms, bathrooms,
            squareFeet, sqft, parking, floors, yearBuilt, price, description } = req.body;
    // 'sqft' is what the frontend sends; 'squareFeet' is an accepted alias
    const resolvedSqft = parseInt(sqft ?? squareFeet);
    const resolvedParking = parseInt(parking);
    const resolvedFloors = parseInt(floors);
    const resolvedYearBuilt = parseInt(yearBuilt);
    const resolvedBedrooms = parseInt(bedrooms);
    const resolvedBathrooms = parseInt(bathrooms);

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: "Property not found" });
    if (property.status !== "MINTED") return res.status(400).json({ error: "Property is not minted yet" });
    if (property.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
      console.log("Owner mismatch:", property.ownerWallet, "vs", wallet);
      return res.status(403).json({ error: "Only the owner can submit updates" });
    }

    // Get current version number
    const lastVersion = await prisma.metadataVersion.findFirst({
      where: { propertyId: id },
      orderBy: { versionNo: "desc" },
    });
    const newVersionNo = lastVersion ? lastVersion.versionNo + 1 : 2;

    // Hash and save new files (if any)
    let imageHashes = [];
    let docHashes = [];
    let savedDocs = [];

    if (req.files && (req.files.images || req.files.documents)) {
      ({ savedDocs, imageHashes, docHashes } = await processAndSaveFiles(
        req.files, id, wallet, newVersionNo
      ));
    }

    const imagesRootHash = imageHashes.length > 0 ? computeRootHash(imageHashes) : property.imagesRootHash;
    const documentsRootHash = docHashes.length > 0 ? computeRootHash(docHashes) : property.documentsRootHash;

    const metadataObj = {
      name: name || property.name,
      location: location || property.location,
      propertyType: propertyType || property.propertyType,
      bedrooms:   !isNaN(resolvedBedrooms)   ? resolvedBedrooms   : property.bedrooms,
      bathrooms:  !isNaN(resolvedBathrooms)  ? resolvedBathrooms  : property.bathrooms,
      squareFeet: !isNaN(resolvedSqft)       ? resolvedSqft       : property.squareFeet,
      parking:    !isNaN(resolvedParking)    ? resolvedParking    : (property.parking  ?? 0),
      floors:     !isNaN(resolvedFloors)     ? resolvedFloors     : (property.floors   ?? 0),
      yearBuilt:  !isNaN(resolvedYearBuilt)  ? resolvedYearBuilt  : (property.yearBuilt ?? 0),
      price: price || property.price,
      description: description || property.description || "",
      imagesRootHash,
      documentsRootHash,
      version: newVersionNo,
    };

    const metadataHash = hashMetadata(metadataObj);

    const request = await prisma.request.create({
      data: {
        propertyId: id,
        type: "UPDATE",
        status: "PENDING",
        metadataHash,
        imagesRootHash,
        documentsRootHash,
        metadataSnapshot: metadataObj,
        submittedBy: wallet.toLowerCase(),
        documentIds: savedDocs.map((d) => d.id),
        },
      });

      notifyAdmin('PROPERTY_UPDATE_SUBMITTED', 'Property update submitted', `An update request was submitted for review.`, '/dashboard/property-approvals');

      res.status(201).json({
        message: "Update request submitted",
        requestId: request.id,
        hashes: { metadataHash, imagesRootHash, documentsRootHash },
      });
    } catch (err) {
      console.error("[POST /properties/:id/update-request]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/properties
// List all minted properties (searchable)
// Query params: ?location=&propertyType=&minPrice=&maxPrice=&bedrooms=
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { location, propertyType, bedrooms, minPrice, maxPrice } = req.query;

    const where = { status: "MINTED" };
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (propertyType) where.propertyType = propertyType;
    if (bedrooms) where.bedrooms = parseInt(bedrooms);

    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        tokenId: true,
        ownerWallet: true,
        name: true,
        location: true,
        propertyType: true,
        bedrooms: true,
        bathrooms: true,
        squareFeet: true,
        parking: true,
        floors: true,
        yearBuilt: true,
        description: true,
        price: true,
        metadataHash: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(properties);
  } catch (err) {
    console.error("[GET /properties]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/properties/:id
// Full property detail (no file bytes — use /images and /documents for those)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        metadataVersions: { orderBy: { versionNo: "desc" } },
        requests: { orderBy: { submittedAt: "desc" } },
      },
    });
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (err) {
    console.error("[GET /properties/:id]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/properties/:id/images
// Returns all images for a property as base64 (latest version)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/images", async (req, res) => {
  try {
    const { versionNo } = req.query;

    const where = { propertyId: req.params.id, fileType: "IMAGE" };
    if (versionNo) where.versionNo = parseInt(versionNo);

    const images = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    const result = images.map((img) => ({
      id: img.id,
      fileName: img.fileName,
      mimeType: img.mimeType,
      sha256Hash: img.sha256Hash,
      sizeBytes: img.sizeBytes,
      versionNo: img.versionNo,
      data: img.fileData.toString("base64"),
    }));

    res.json(result);
  } catch (err) {
    console.error("[GET /properties/:id/images]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/properties/:id/documents
// Returns all documents for a property as base64 (latest version)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/documents", async (req, res) => {
  try {
    const { versionNo } = req.query;

    const where = { propertyId: req.params.id, fileType: "DOCUMENT" };
    if (versionNo) where.versionNo = parseInt(versionNo);

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    const result = documents.map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      docType: doc.docType,
      sha256Hash: doc.sha256Hash,
      sizeBytes: doc.sizeBytes,
      versionNo: doc.versionNo,
      data: doc.fileData.toString("base64"),
    }));

    res.json(result);
  } catch (err) {
    console.error("[GET /properties/:id/documents]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
