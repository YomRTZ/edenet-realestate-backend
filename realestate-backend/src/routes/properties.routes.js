import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import prisma from '../prisma/prismaClient.js';
import { validateSession } from '../middleware/validateSession.middleware.js';

export const propertyRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── UTILITY FUNCTIONS FOR INTEGRATED CALCULATIONS ───
const hashBuffer = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

const computeRootHash = (hashes) => {
  if (hashes.length === 0) return crypto.createHash("sha256").update("").digest("hex");
  if (hashes.length === 1) return hashes[0];
  let level = [...hashes];
  while (level.length > 1) {
    if (level.length % 2 !== 0) level.push(level[level.length - 1]);
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      nextLevel.push(crypto.createHash("sha256").update(level[i] + level[i + 1], "hex").digest("hex"));
    }
    level = nextLevel;
  }
  return level[0];
};

const hashMetadata = (obj) => {
  const canonical = JSON.stringify(obj, (k, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.keys(v).sort().reduce((s, key) => { s[key] = v[key]; return s; }, {});
    }
    return v;
  });
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
};

// ─── ENDPOINT 1: USER REGISTRATION SUBMISSION (CITIZEN) ───
propertyRouter.post('/', validateSession, upload.fields([{ name: 'images' }, { name: 'documents' }]), async (req, res) => {
  try {
    // Debug logging to pinpoint why POST /api/properties is returning 500
    console.log('[POST /api/properties] handler entered');

    const imagesCount = (req.files && req.files['images']) ? req.files['images'].length : 0;
    const documentsCount = (req.files && req.files['documents']) ? req.files['documents'].length : 0;

    console.log('[POST /api/properties] received', {
      bodyKeys: req.body ? Object.keys(req.body) : [],
      title: req.body && req.body.title,
      property_type: req.body && req.body.property_type,
      listing_type: req.body && req.body.listing_type,
      price: req.body && req.body.price,
      city: req.body && req.body.city,
      country: req.body && req.body.country,
      imagesCount,
      documentsCount,
      hasUser: !!req.user,
      walletAddress: req.user && req.user.walletAddress ? String(req.user.walletAddress) : undefined,
    });

    const body = req.body;

    const imgHashes = (req.files['images'] || []).map(f => hashBuffer(f.buffer));
    const docHashes = (req.files['documents'] || []).map(f => hashBuffer(f.buffer));


    const imagesRootHash = computeRootHash(imgHashes);
    const documentsRootHash = computeRootHash(docHashes);

    const canonicalMetadata = {
      title: body.title,
      description: body.description || '',
      propertyType: body.property_type,
      listingType: body.listing_type,
      price: body.price,
      city: body.city,
      state: body.state || '',
      zipCode: body.zip_code || '',
      country: body.country,
      imagesRootHash,
      documentsRootHash,
    };

    const metadataHash = hashMetadata(canonicalMetadata);

    // Extra debug to pinpoint Prisma/TypeError 500s
    console.log('[POST /api/properties] integrity check', {
      reqUser: {
        walletAddress: req.user?.walletAddress,
        role: req.user?.role,
      },
      input: {
        title: body.title,
        property_type: body.property_type,
        listing_type: body.listing_type,
        price: body.price,
        city: body.city,
        country: body.country,
        state: body.state,
        zip_code: body.zip_code,
        description: body.description,
      },
      derived: {
        canonicalMetadata,
        metadataHash,
        imagesRootHash,
        documentsRootHash,
      },
    });

    const savedData = await prisma.$transaction(async (tx) => {

      const property = await tx.property.create({
        data: {
          tokenId: `PENDING-${Date.now()}`,
          ownerWallet: req.user.walletAddress.toLowerCase(),
          status: 'PENDING',
          title: canonicalMetadata.title,
          description: canonicalMetadata.description,
          propertyType: canonicalMetadata.propertyType,
          listingType: canonicalMetadata.listingType,
          price: canonicalMetadata.price,
          city: canonicalMetadata.city,
          state: canonicalMetadata.state,
          zipCode: canonicalMetadata.zipCode,
          country: canonicalMetadata.country,
          metadataHash,
          imagesRootHash,
          documentsRootHash
        }
      });

      const fileEntries = [
        ...(req.files['images'] || []).map((f, i) => ({ propertyId: property.id, type: 'IMAGE', fileName: f.originalname, fileUrl: `/uploads/${f.originalname}`, sha256Hash: imgHashes[i] })),
        ...(req.files['documents'] || []).map((f, i) => ({ propertyId: property.id, type: 'DOCUMENT', fileName: f.originalname, fileUrl: `/uploads/${f.originalname}`, sha256Hash: docHashes[i] }))
      ];

      if (fileEntries.length > 0) await tx.propertyFile.createMany({ data: fileEntries });
      await tx.metadataVersion.create({ data: { propertyId: property.id, version: 1, metadataHash, snapshot: canonicalMetadata } });
      return property;
    });

    return res.status(201).json({ success: true, data: { propertyId: savedData.id, metadataHash, imagesRootHash, documentsRootHash } });
  } catch (err) {
    console.error('[POST /api/properties] 500 error', err);
    return res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' });
  }
});

// ─── ENDPOINT 2: RETRIEVE REGISTERS FOR MANAGEMENT (GOVERNMENT ADMIN) ───
propertyRouter.get('/pending', validateSession, async (req, res) => {
  if (req.user.role !== 'Government') return res.status(403).json({ error: 'Denied. Admins only.' });
  try {
    const list = await prisma.property.findMany({ where: { status: 'PENDING' } });
    return res.json({ success: true, properties: list });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── ENDPOINT 3: POST-MINT DATA SYNCHRONIZATION ───
propertyRouter.post('/confirm', validateSession, async (req, res) => {
  if (req.user.role !== 'Government') return res.status(403).json({ error: 'Denied. Admins only.' });
  try {
    const { propertyId, tokenId, chainHash } = req.body;
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: 'ACTIVE', tokenId: String(tokenId), chainHash }
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── ENDPOINT 4: FETCH ACTIVE (MINTED) PROPERTIES FOR CITIZEN VIEW ───
// Returns all minted/active properties. Frontend can further filter if needed.
propertyRouter.get('/active', validateSession, async (req, res) => {
  try {
    // Citizens only (no admin-only restriction here since it is a public listing in your UX)
    // If you want to restrict to Citizen role, uncomment below.
    // if (req.user.role !== 'Citizen') return res.status(403).json({ error: 'Denied. Citizens only.' });

    const list = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        files: true,
      },
    });

    const mapped = list.map((p) => {
      const firstImage = (p.files || []).find((f) => f.type === 'IMAGE') || null;
      return {
        id: p.id,
        tokenId: p.tokenId,
        status: p.status,
        title: p.title,
        description: p.description,
        propertyType: p.propertyType,
        listingType: p.listingType,
        // Keep defensive fields in case they're not present in DB.
        price: p.price,
        rentRate: p.rentRate,
        rentPeriod: p.rentPeriod,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        areaSize: p.areaSize,
        city: p.city,
        state: p.state,
        country: p.country,
        image: firstImage ? firstImage.fileUrl : null,
        ownerWallet: p.ownerWallet,
      };
    });

    return res.json({ success: true, properties: mapped });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

