// src/services/kycService.js
// Business logic for KYC document upload and status checks.

const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const prisma = require('../config/db');
const { hashBuffer } = require('../utils/hash');
const { notifyAdmin } = require('../utils/notifications');

/**
 * Upload KYC documents, verify wallet ownership, and move user to PENDING_APPROVAL.
 */
async function uploadDocuments(userId, userStatus, files, body) {
  const { walletAddress, signature, message } = body;

  if (userStatus !== 'PENDING_KYC') {
    const msgMap = {
      PENDING_EMAIL: 'Please verify your email first',
      PENDING_APPROVAL: 'Your documents are already submitted and pending review',
      ACTIVE: 'Your account is already verified',
    };
    throw Object.assign(
      new Error(msgMap[userStatus] || 'Cannot upload documents in current status'),
      { status: 400 }
    );
  }

  if (!files?.idFront || !files?.idBack || !files?.selfie) {
    throw Object.assign(
      new Error('All three documents are required: ID front, ID back, and selfie'),
      { status: 400 }
    );
  }

  if (!walletAddress || !signature || !message) {
    throw Object.assign(
      new Error('Wallet connection is required. Please connect your wallet before submitting.'),
      { status: 400 }
    );
  }

  // Verify wallet isn't already linked to another account
  const existingWallet = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
  if (existingWallet && existingWallet.id !== userId) {
    throw Object.assign(new Error('This wallet is already linked to another account'), { status: 409 });
  }

  // Verify signature
  try {
    const recovered = ethers.utils.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      throw Object.assign(new Error('Signature verification failed'), { status: 400 });
    }
  } catch (err) {
    if (err.status) throw err;
    throw Object.assign(new Error('Invalid signature'), { status: 400 });
  }

  // Save documents
  const docDefs = [
    { type: 'ID_FRONT', file: files.idFront[0] },
    { type: 'ID_BACK', file: files.idBack[0] },
    { type: 'SELFIE', file: files.selfie[0] },
  ];

  const savedDocuments = [];
  for (const { type, file } of docDefs) {
    const sha256Hash = hashBuffer(file.buffer);
    const kycDoc = await prisma.kycDocument.create({
      data: { userId, fileData: file.buffer, sha256Hash, docType: type, status: 'PENDING' },
    });
    savedDocuments.push({ id: kycDoc.id, docType: kycDoc.docType, status: kycDoc.status });
  }

  // Promote user status and link wallet
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: 'PENDING_APPROVAL', walletAddress: walletAddress.toLowerCase() },
  });

  notifyAdmin(
    'KYC_SUBMITTED',
    'KYC submitted for review',
    `${updatedUser.email} submitted identity documents.`,
    '/dashboard/verifications'
  );

  const token = jwt.sign(
    { id: updatedUser.id, email: updatedUser.email, status: updatedUser.status, walletAddress: updatedUser.walletAddress },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    message: 'Documents submitted successfully. Your application is now pending review.',
    documents: savedDocuments,
    token,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      status: updatedUser.status,
      walletAddress: updatedUser.walletAddress,
    },
  };
}

/**
 * Get KYC status and submitted documents for the current user.
 */
async function getStatus(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      kycDocuments: {
        select: { id: true, docType: true, status: true, reviewedAt: true, reviewedBy: true },
        orderBy: { reviewedAt: 'desc' },
      },
    },
  });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  return { status: user.status, documents: user.kycDocuments };
}

module.exports = { uploadDocuments, getStatus };
