// src/services/propertyService.js
// Business logic for property mint requests, update requests, and listing queries.
// Input shape is guaranteed by zod schemas — no redundant field-presence checks.

const crypto = require('crypto');
const prisma  = require('../config/db');
const { hashBuffer, hashMetadata, computeRootHash } = require('../utils/hash');
const { notifyAdmin } = require('../utils/notifications');

// ── In-memory pending-upload cache ───────────────────────────────────────────
// Stores hashed files between /prepare and /confirm (10 min TTL).
// In production, replace with Redis.
const pendingUploads = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of pendingUploads.entries()) {
    if (val.expiresAt < now) pendingUploads.delete(key);
  }
}, 5 * 60_000);

// ── Private helpers ───────────────────────────────────────────────────────────

async function saveFiles(files, propertyId, uploaderWallet, versionNo = 1) {
  const images    = files.images    || [];
  const documents = files.documents || [];
  const imageHashes = [];
  const docHashes   = [];
  const savedDocs   = [];

  for (const file of images) {
    const hash = hashBuffer(file.buffer);
    imageHashes.push(hash);
    savedDocs.push(await prisma.document.create({
      data: {
        propertyId, fileData: file.buffer, sha256Hash: hash,
        fileName: file.originalname, mimeType: file.mimetype,
        fileType: 'IMAGE', docType: 'photo',
        versionNo, sizeBytes: file.size,
        uploadedBy: uploaderWallet.toLowerCase(),
      },
    }));
  }

  for (const file of documents) {
    const hash = hashBuffer(file.buffer);
    docHashes.push(hash);
    savedDocs.push(await prisma.document.create({
      data: {
        propertyId, fileData: file.buffer, sha256Hash: hash,
        fileName: file.originalname, mimeType: file.mimetype,
        fileType: 'DOCUMENT', docType: 'deed',
        versionNo, sizeBytes: file.size,
        uploadedBy: uploaderWallet.toLowerCase(),
      },
    }));
  }

  return { savedDocs, imageHashes, docHashes };
}

// ── Service methods ───────────────────────────────────────────────────────────

/**
 * Step 1 of the two-step mint flow.
 * Hash files and store in memory; return hashes for the on-chain transaction.
 * Does NOT write to the DB yet.
 */
async function prepareRequest(body, files) {
  // All required fields (wallet, name, location, propertyType, price)
  // are guaranteed present and coerced by propertyDetailsSchema.
  const {
    wallet, name, location, propertyType,
    bedrooms = 0, bathrooms = 0, sqft = 0,
    parking = 0, floors = 0, yearBuilt = 0,
    price, description = '',
  } = body;

  const imageFiles = files?.images   || [];
  const docFiles   = files?.documents || [];

  const imageHashes = imageFiles.map((f) => hashBuffer(f.buffer));
  const docHashes   = docFiles.map((f)   => hashBuffer(f.buffer));

  const imagesRootHash    = computeRootHash(imageHashes);
  const documentsRootHash = computeRootHash(docHashes);

  const metadataObj = {
    name, location, propertyType,
    bedrooms:    Number(bedrooms),
    bathrooms:   Number(bathrooms),
    squareFeet:  Number(sqft),
    parking:     Number(parking),
    floors:      Number(floors),
    yearBuilt:   Number(yearBuilt),
    price:       price.toString(),
    description,
    imagesRootHash,
    documentsRootHash,
    version: 1,
  };
  const metadataHash = hashMetadata(metadataObj);

  const tempId = crypto.randomUUID();
  pendingUploads.set(tempId, {
    wallet, metadataObj, metadataHash, imagesRootHash, documentsRootHash,
    imageFiles, docFiles,
    expiresAt: Date.now() + 10 * 60_000,
  });

  return { tempId, hashes: { metadataHash, imagesRootHash, documentsRootHash } };
}

/**
 * Step 2 of the two-step mint flow.
 * Called after MetaMask confirms — persist everything to the DB.
 * tempId and txHash are validated by confirmRequestSchema.
 */
async function confirmRequest(tempId, txHash) {
  const pending = pendingUploads.get(tempId);
  if (!pending) {
    throw Object.assign(
      new Error('No pending upload found — may have expired (10 min limit)'),
      { status: 404 }
    );
  }
  pendingUploads.delete(tempId);

  const {
    wallet, metadataObj, metadataHash,
    imagesRootHash, documentsRootHash,
    imageFiles, docFiles,
  } = pending;

  const property = await prisma.property.create({
    data: {
      tokenId:      `pending_${Date.now()}`,
      ownerWallet:  wallet.toLowerCase(),
      status:       'PENDING',
      name:         metadataObj.name,
      location:     metadataObj.location,
      propertyType: metadataObj.propertyType,
      bedrooms:     metadataObj.bedrooms,
      bathrooms:    metadataObj.bathrooms,
      squareFeet:   metadataObj.squareFeet,
      parking:      metadataObj.parking,
      floors:       metadataObj.floors,
      yearBuilt:    metadataObj.yearBuilt,
      price:        metadataObj.price,
      description:  metadataObj.description || null,
      metadataHash,
      imagesRootHash,
      documentsRootHash,
    },
  });

  const savedDocs = [];
  for (const file of imageFiles) {
    savedDocs.push(await prisma.document.create({
      data: {
        propertyId: property.id, fileData: file.buffer,
        sha256Hash: hashBuffer(file.buffer),
        fileName: file.originalname, mimeType: file.mimetype,
        fileType: 'IMAGE', docType: 'photo',
        versionNo: 1, sizeBytes: file.size,
        uploadedBy: wallet.toLowerCase(),
      },
    }));
  }
  for (const file of docFiles) {
    savedDocs.push(await prisma.document.create({
      data: {
        propertyId: property.id, fileData: file.buffer,
        sha256Hash: hashBuffer(file.buffer),
        fileName: file.originalname, mimeType: file.mimetype,
        fileType: 'DOCUMENT', docType: 'deed',
        versionNo: 1, sizeBytes: file.size,
        uploadedBy: wallet.toLowerCase(),
      },
    }));
  }

  const request = await prisma.request.create({
    data: {
      propertyId:       property.id,
      type:             'MINT',
      status:           'PENDING',
      metadataHash,
      imagesRootHash,
      documentsRootHash,
      metadataSnapshot: metadataObj,
      submittedBy:      wallet.toLowerCase(),
      documentIds:      savedDocs.map((d) => d.id),
    },
  });

  notifyAdmin(
    'PROPERTY_SUBMITTED', 'New property submission',
    `${metadataObj.name} was submitted for review.`,
    '/dashboard/property-approvals'
  );

  return {
    message:    'Property request confirmed and saved',
    requestId:  request.id,
    propertyId: property.id,
    txHash,
  };
}

/**
 * Submit a metadata update request for an already-minted property.
 * All fields are validated by propertyDetailsSchema — wallet is present.
 */
async function submitUpdateRequest(propertyId, body, files) {
  const {
    wallet, name, location, propertyType,
    bedrooms, bathrooms, sqft,
    parking, floors, yearBuilt,
    price, description,
  } = body;

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw Object.assign(new Error('Property not found'), { status: 404 });
  if (property.status !== 'MINTED') {
    throw Object.assign(new Error('Property is not minted yet'), { status: 400 });
  }
  if (property.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
    throw Object.assign(new Error('Only the owner can submit updates'), { status: 403 });
  }

  const lastVersion = await prisma.metadataVersion.findFirst({
    where:   { propertyId },
    orderBy: { versionNo: 'desc' },
  });
  const newVersionNo = lastVersion ? lastVersion.versionNo + 1 : 2;

  let imageHashes = [];
  let docHashes   = [];
  let savedDocs   = [];

  if (files && (files.images?.length || files.documents?.length)) {
    ({ savedDocs, imageHashes, docHashes } = await saveFiles(files, propertyId, wallet, newVersionNo));
  }

  const imagesRootHash    = imageHashes.length ? computeRootHash(imageHashes) : property.imagesRootHash;
  const documentsRootHash = docHashes.length   ? computeRootHash(docHashes)   : property.documentsRootHash;

  const metadataObj = {
    name:         name         ?? property.name,
    location:     location     ?? property.location,
    propertyType: propertyType ?? property.propertyType,
    bedrooms:     bedrooms     != null ? Number(bedrooms)   : property.bedrooms,
    bathrooms:    bathrooms    != null ? Number(bathrooms)  : property.bathrooms,
    squareFeet:   sqft         != null ? Number(sqft)       : property.squareFeet,
    parking:      parking      != null ? Number(parking)    : (property.parking  ?? 0),
    floors:       floors       != null ? Number(floors)     : (property.floors   ?? 0),
    yearBuilt:    yearBuilt    != null ? Number(yearBuilt)  : (property.yearBuilt ?? 0),
    price:        price        ?? property.price,
    description:  description  ?? property.description ?? '',
    imagesRootHash,
    documentsRootHash,
    version: newVersionNo,
  };
  const metadataHash = hashMetadata(metadataObj);

  const request = await prisma.request.create({
    data: {
      propertyId,
      type:             'UPDATE',
      status:           'PENDING',
      metadataHash,
      imagesRootHash,
      documentsRootHash,
      metadataSnapshot: metadataObj,
      submittedBy:      wallet.toLowerCase(),
      documentIds:      savedDocs.map((d) => d.id),
    },
  });

  notifyAdmin(
    'PROPERTY_UPDATE_SUBMITTED', 'Property update submitted',
    'An update request was submitted for review.',
    '/dashboard/property-approvals'
  );

  return {
    message:   'Update request submitted',
    requestId: request.id,
    hashes:    { metadataHash, imagesRootHash, documentsRootHash },
  };
}

/**
 * List all MINTED properties (with optional filters).
 * Query params are coerced by listPropertiesQuerySchema.
 */
async function listProperties(query) {
  const { location, propertyType, bedrooms } = query;
  const where = { status: 'MINTED' };
  if (location)     where.location     = { contains: location, mode: 'insensitive' };
  if (propertyType) where.propertyType = propertyType;
  if (bedrooms)     where.bedrooms     = Number(bedrooms);

  return prisma.property.findMany({
    where,
    select: {
      id: true, tokenId: true, ownerWallet: true, name: true, location: true,
      propertyType: true, bedrooms: true, bathrooms: true, squareFeet: true,
      parking: true, floors: true, yearBuilt: true, description: true,
      price: true, metadataHash: true, createdAt: true,
      isForRent: true, isRented: true, monthlyRent: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get full property detail with metadata versions and requests.
 */
async function getPropertyById(id) {
  const property = await prisma.property.findUnique({
    where:   { id },
    include: {
      metadataVersions: { orderBy: { versionNo: 'desc' } },
      requests:         { orderBy: { submittedAt: 'desc' } },
    },
  });
  if (!property) throw Object.assign(new Error('Property not found'), { status: 404 });
  return property;
}

/**
 * Get all images for a property (latest or specific version) as base64.
 */
async function getImages(propertyId, versionNo) {
  const where = { propertyId, fileType: 'IMAGE' };
  if (versionNo) where.versionNo = Number(versionNo);

  const images = await prisma.document.findMany({ where, orderBy: { createdAt: 'asc' } });
  return images.map((img) => ({
    id: img.id, fileName: img.fileName, mimeType: img.mimeType,
    sha256Hash: img.sha256Hash, sizeBytes: img.sizeBytes,
    versionNo: img.versionNo, data: img.fileData.toString('base64'),
  }));
}

/**
 * Get all documents for a property (latest or specific version) as base64.
 */
async function getDocuments(propertyId, versionNo) {
  const where = { propertyId, fileType: 'DOCUMENT' };
  if (versionNo) where.versionNo = Number(versionNo);

  const documents = await prisma.document.findMany({ where, orderBy: { createdAt: 'asc' } });
  return documents.map((doc) => ({
    id: doc.id, fileName: doc.fileName, mimeType: doc.mimeType,
    docType: doc.docType, sha256Hash: doc.sha256Hash,
    sizeBytes: doc.sizeBytes, versionNo: doc.versionNo,
    data: doc.fileData.toString('base64'),
  }));
}

module.exports = {
  prepareRequest, confirmRequest, submitUpdateRequest,
  listProperties, getPropertyById, getImages, getDocuments,
};
