const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { hashBuffer } = require('../utils/hash');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const { notifyAdmin } = require('../utils/notifications');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /api/kyc/upload
 * Upload KYC documents (ID front, back, selfie)
 * Requires authentication and PENDING_KYC status
 */
router.post('/upload', auth, upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), async (req, res) => {
  try {
    // Check user status
    if (req.user.status !== 'PENDING_KYC') {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: req.user.status === 'PENDING_EMAIL' 
          ? 'Please verify your email first'
          : req.user.status === 'PENDING_APPROVAL'
          ? 'Your documents are already submitted and pending review'
          : req.user.status === 'ACTIVE'
          ? 'Your account is already verified'
          : 'Cannot upload documents in current status'
      });
    }

    // Validate files
    if (!req.files || !req.files.idFront || !req.files.idBack || !req.files.selfie) {
      return res.status(400).json({ 
        error: 'All three documents are required: ID front, ID back, and selfie' 
      });
    }

    // Validate wallet fields
    const { walletAddress, signature, message } = req.body;
    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        error: 'Wallet connection is required. Please connect your wallet before submitting.'
      });
    }

    // Check wallet isn't already linked to another account
    const existingWalletUser = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    });
    if (existingWalletUser && existingWalletUser.id !== req.user.id) {
      return res.status(409).json({
        error: 'This wallet is already linked to another account'
      });
    }

    // Verify signature proves wallet ownership
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(400).json({ error: 'Signature verification failed' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const documents = [
      { type: 'ID_FRONT', file: req.files.idFront[0] },
      { type: 'ID_BACK', file: req.files.idBack[0] },
      { type: 'SELFIE', file: req.files.selfie[0] }
    ];

    // Save documents to database
    const savedDocuments = [];
    for (const doc of documents) {
      const sha256Hash = hashBuffer(doc.file.buffer);

      const kycDoc = await prisma.kycDocument.create({
        data: {
          userId: req.user.id,
          fileData: doc.file.buffer,
          sha256Hash,
          docType: doc.type,
          status: 'PENDING'
        }
      });

      savedDocuments.push({
        id: kycDoc.id,
        docType: kycDoc.docType,
        status: kycDoc.status
      });
    }

    // Update user status to PENDING_APPROVAL and link wallet
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { status: 'PENDING_APPROVAL', walletAddress: walletAddress.toLowerCase() }
    });

    notifyAdmin('KYC_SUBMITTED', 'KYC submitted for review', `${updatedUser.email} submitted identity documents.`, '/dashboard/verifications');

    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, status: updatedUser.status, walletAddress: updatedUser.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Documents submitted successfully. Your application is now pending review.',
      documents: savedDocuments,
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        walletAddress: updatedUser.walletAddress
      }
    });
  } catch (error) {
    console.error('KYC upload error:', error);
    
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to upload documents. Please try again.' });
  }
});

/**
 * GET /api/kyc/status
 * Get KYC status and documents for current user
 * Requires authentication
 */
router.get('/status', auth, async (req, res) => {
  try {
    // Get user with KYC documents
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        kycDocuments: {
          select: {
            id: true,
            docType: true,
            status: true,
            reviewedAt: true,
            reviewedBy: true
          },
          orderBy: {
            reviewedAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      status: user.status,
      documents: user.kycDocuments
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

module.exports = router;
