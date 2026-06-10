// src/services/adminService.js
// Business logic for government admin actions: approve/decline requests, KYC review, analytics.

const prisma = require('../config/db');
const {
  mintPropertyOnChain,
  approveUpdateOnChain,
  declineUpdateOnChain,
  getPropertyNFT,
  getOnChainListingStatusMap,
} = require('../utils/contract');
const { sendApprovalNotification, sendRejectionNotification } = require('../utils/email');
const { notifyUser, notifyAdmin, notifyUserByWallet } = require('../utils/notifications');

// ── Requests ─────────────────────────────────────────────────────────────────

async function listRequests(status = 'PENDING', type) {
  const where = { status };
  if (type) where.type = type;

  const requests = await prisma.request.findMany({
    where,
    include: {
      property: { select: { id: true, tokenId: true, name: true, location: true, ownerWallet: true } },
    },
    orderBy: { submittedAt: 'asc' },
  });

  return requests.map((r) => ({
    ...r,
    name: r.property?.name ?? r.metadataSnapshot?.name ?? null,
    location: r.property?.location ?? r.metadataSnapshot?.location ?? null,
    price: r.metadataSnapshot?.price ?? null,
    tokenId: r.property?.tokenId ?? null,
    propertyId: r.property?.id ?? r.propertyId ?? null,
  }));
}

async function approveRequest(requestId, govWallet, { onChainRequestId, onChainUpdateIndex } = {}) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { property: true },
  });
  if (!request) throw Object.assign(new Error('Request not found'), { status: 404 });
  if (request.status !== 'PENDING') {
    throw Object.assign(new Error(`Request is already ${request.status}`), { status: 400 });
  }

  const { metadataHash, imagesRootHash, documentsRootHash } = request;

  // ── MINT ────────────────────────────────────────────────────────────────────
  if (request.type === 'MINT') {
    if (onChainRequestId === undefined || onChainRequestId === null) {
      throw Object.assign(new Error('onChainRequestId is required'), { status: 400 });
    }

    let receipt;
    try {
      receipt = await mintPropertyOnChain(onChainRequestId);
    } catch (err) {
      throw Object.assign(new Error('Blockchain call failed: ' + err.message), { status: 502 });
    }

    let mintedTokenId = onChainRequestId.toString();
    try {
      const approvedEvent = receipt.events?.find((e) => e.event === 'RequestApproved');
      if (approvedEvent) mintedTokenId = approvedEvent.args.propertyId.toString();
    } catch (_) {}

    await prisma.$transaction([
      prisma.request.update({
        where: { id: requestId },
        data: { status: 'APPROVED', reviewedBy: govWallet, reviewedAt: new Date() },
      }),
      prisma.property.update({
        where: { id: request.propertyId },
        data: { tokenId: mintedTokenId, status: 'MINTED', chainHash: metadataHash },
      }),
      prisma.metadataVersion.create({
        data: {
          propertyId: request.propertyId,
          versionNo: 1,
          metadataHash,
          imagesRootHash,
          documentsRootHash,
          metadataSnapshot: request.metadataSnapshot,
          approvedBy: govWallet,
        },
      }),
    ]);

    notifyUserByWallet(
      request.submittedBy,
      'PROPERTY_APPROVED',
      'Property approved',
      `Your property listing has been minted on-chain (token #${mintedTokenId}).`,
      '/dashboard/my-properties'
    );

    return { message: 'Mint request approved', tokenId: mintedTokenId, txHash: receipt.transactionHash };
  }

  // ── UPDATE ──────────────────────────────────────────────────────────────────
  if (request.type === 'UPDATE') {
    const property = request.property;
    if (!property || property.status !== 'MINTED') {
      throw Object.assign(new Error('Property is not minted yet'), { status: 400 });
    }

    const lastVersion = await prisma.metadataVersion.findFirst({
      where: { propertyId: request.propertyId },
      orderBy: { versionNo: 'desc' },
    });
    const newVersionNo = lastVersion ? lastVersion.versionNo + 1 : 2;

    // Find pending update index on-chain
    const onChainUpdates = await getPropertyNFT().getUpdateRequests(property.tokenId);
    let pendingIndex = -1;
    for (let i = 0; i < onChainUpdates.length; i++) {
      if (Number(onChainUpdates[i].status) === 0) { pendingIndex = i; break; }
    }
    if (pendingIndex === -1) {
      throw Object.assign(new Error('No pending update request found on-chain'), { status: 400 });
    }

    let receipt;
    try {
      receipt = await approveUpdateOnChain(property.tokenId, pendingIndex);
    } catch (err) {
      throw Object.assign(new Error('Blockchain call failed: ' + err.message), { status: 502 });
    }

    const snap = request.metadataSnapshot;
    await prisma.$transaction([
      prisma.request.update({
        where: { id: requestId },
        data: { status: 'APPROVED', reviewedBy: govWallet, reviewedAt: new Date() },
      }),
      prisma.property.update({
        where: { id: request.propertyId },
        data: {
          metadataHash, imagesRootHash, documentsRootHash, chainHash: metadataHash,
          name: snap.name, location: snap.location, propertyType: snap.propertyType,
          bedrooms: snap.bedrooms, bathrooms: snap.bathrooms, squareFeet: snap.squareFeet,
          parking: snap.parking ?? undefined, floors: snap.floors ?? undefined,
          yearBuilt: snap.yearBuilt ?? undefined, price: snap.price,
          description: snap.description ?? undefined,
        },
      }),
      prisma.metadataVersion.create({
        data: {
          propertyId: request.propertyId,
          versionNo: newVersionNo,
          metadataHash, imagesRootHash, documentsRootHash,
          metadataSnapshot: snap,
          approvedBy: govWallet,
        },
      }),
    ]);

    notifyUserByWallet(
      request.submittedBy,
      'PROPERTY_UPDATE_APPROVED',
      'Property update approved',
      `Your update to the property listing has been approved (version ${newVersionNo}).`,
      '/dashboard/my-properties'
    );

    return { message: 'Update request approved', newVersion: newVersionNo, txHash: receipt.transactionHash };
  }

  throw Object.assign(new Error('Unknown request type'), { status: 400 });
}

async function declineRequest(requestId, govWallet, reason, updateIndex) {
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { property: true },
  });
  if (!request) throw Object.assign(new Error('Request not found'), { status: 404 });
  if (request.status !== 'PENDING') {
    throw Object.assign(new Error(`Request is already ${request.status}`), { status: 400 });
  }

  if (request.type === 'UPDATE') {
    const property = request.property;
    if (!property || property.status !== 'MINTED') {
      throw Object.assign(new Error('Property is not minted — cannot decline update on-chain'), { status: 400 });
    }

    let pendingIndex = typeof updateIndex === 'number' ? updateIndex : -1;
    if (pendingIndex === -1) {
      const updates = await getPropertyNFT().getUpdateRequests(property.tokenId);
      for (let i = 0; i < updates.length; i++) {
        if (Number(updates[i].status) === 0) { pendingIndex = i; break; }
      }
    }

    if (pendingIndex !== -1) {
      try {
        await declineUpdateOnChain(property.tokenId, pendingIndex, reason || '');
      } catch (err) {
        throw Object.assign(new Error('Blockchain call failed: ' + err.message), { status: 502 });
      }
    } else {
      console.warn('[adminService] No pending on-chain update found — declining DB only');
    }
  }

  await prisma.$transaction([
    prisma.request.update({
      where: { id: requestId },
      data: { status: 'DECLINED', reviewedBy: govWallet, reviewedAt: new Date(), declineReason: reason || null },
    }),
    ...(request.type === 'MINT' && request.propertyId
      ? [prisma.property.update({ where: { id: request.propertyId }, data: { status: 'DECLINED' } })]
      : []),
  ]);

  notifyUserByWallet(
    request.submittedBy,
    'PROPERTY_DECLINED',
    'Property request declined',
    reason || 'Your property request was declined.',
    '/dashboard/my-requests'
  );

  return { message: 'Request declined', requestId, reason };
}

// ── Users & KYC ──────────────────────────────────────────────────────────────

async function listUsers() {
  const govWallet = (process.env.GOV_WALLET || '').toLowerCase();
  const users = await prisma.user.findMany({
    include: {
      kycDocuments: { select: { id: true, docType: true, status: true, reviewedAt: true, reviewedBy: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    status: u.status,
    walletAddress: u.walletAddress,
    authProvider: u.authProvider,
    createdAt: u.createdAt,
    role: u.walletAddress && u.walletAddress.toLowerCase() === govWallet ? 'GOVERNMENT' : 'CITIZEN',
    kycDocuments: u.kycDocuments,
  }));
}

async function listPendingKyc() {
  return prisma.user.findMany({
    where: { status: 'PENDING_APPROVAL' },
    select: {
      id: true, email: true, createdAt: true,
      kycDocuments: { select: { id: true, docType: true, status: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

async function getKycDocument(userId, docId) {
  const doc = await prisma.kycDocument.findFirst({ where: { id: docId, userId } });
  if (!doc) throw Object.assign(new Error('Document not found'), { status: 404 });
  return doc;
}

async function approveKyc(userId, reviewerId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { kycDocuments: true } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  if (user.status !== 'PENDING_APPROVAL') {
    throw Object.assign(new Error(`Cannot approve user with status ${user.status}`), { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: 'ACTIVE' } }),
    prisma.kycDocument.updateMany({
      where: { userId },
      data: { status: 'APPROVED', reviewedBy: reviewerId, reviewedAt: new Date() },
    }),
  ]);

  sendApprovalNotification(user.email).catch((err) =>
    console.error('[adminService] approval email failed:', err.message)
  );

  notifyUser(userId, 'KYC_APPROVED', 'Identity verified',
    'Your account has been approved. You can now connect your wallet.',
    '/dashboard'
  );

  return { message: 'User approved successfully', userId, email: user.email };
}

async function rejectKyc(userId, reviewerId, reason) {
  if (!reason) throw Object.assign(new Error('Rejection reason is required'), { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { kycDocuments: true } });
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  if (user.status !== 'PENDING_APPROVAL') {
    throw Object.assign(new Error(`Cannot reject user with status ${user.status}`), { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: 'REJECTED' } }),
    prisma.kycDocument.updateMany({
      where: { userId },
      data: { status: 'REJECTED', reviewedBy: reviewerId, reviewedAt: new Date() },
    }),
  ]);

  sendRejectionNotification(user.email, reason).catch((err) =>
    console.error('[adminService] rejection email failed:', err.message)
  );

  notifyUser(userId, 'KYC_REJECTED', 'Identity verification declined',
    reason || 'Your KYC application was rejected.',
    '/kyc/pending'
  );

  return { message: 'User rejected', userId, email: user.email, reason };
}

// ── Analytics ────────────────────────────────────────────────────────────────

async function getAnalytics() {
  const [properties, requests, users] = await Promise.all([
    prisma.property.findMany({ select: { tokenId: true, status: true, isForRent: true, createdAt: true } }),
    prisma.request.findMany({ select: { type: true, status: true, submittedAt: true } }),
    prisma.user.findMany({ select: { status: true, createdAt: true } }),
  ]);

  // Property status breakdown
  const propertyStatusCounts = { PENDING: 0, MINTED: 0, DECLINED: 0 };
  for (const p of properties) {
    if (propertyStatusCounts[p.status] != null) propertyStatusCounts[p.status]++;
  }

  // On-chain listing status
  let listingStatusMap = {};
  try {
    listingStatusMap = await getOnChainListingStatusMap();
  } catch (err) {
    console.error('[analytics] Could not read on-chain listing status:', err.message);
  }

  const minted = properties.filter((p) => p.status === 'MINTED');
  let forSaleCount = 0, forRentCount = 0, unlistedCount = 0;
  for (const p of minted) {
    const cs = listingStatusMap[p.tokenId];
    if (cs?.isForSale) forSaleCount++;
    if (p.isForRent) forRentCount++;
    if (!cs?.isForSale && !p.isForRent) unlistedCount++;
  }

  // User status breakdown
  const userStatusCounts = { PENDING_EMAIL: 0, PENDING_KYC: 0, PENDING_APPROVAL: 0, ACTIVE: 0, REJECTED: 0 };
  for (const u of users) {
    if (userStatusCounts[u.status] != null) userStatusCounts[u.status]++;
  }

  // Submission trends by month
  function monthKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  const trendsMap = new Map();
  for (const r of requests) {
    const key = monthKey(r.submittedAt);
    if (!trendsMap.has(key)) trendsMap.set(key, { month: key, mint: 0, update: 0, approved: 0, declined: 0, pending: 0 });
    const b = trendsMap.get(key);
    if (r.type === 'MINT') b.mint++;
    if (r.type === 'UPDATE') b.update++;
    if (r.status === 'APPROVED') b.approved++;
    if (r.status === 'DECLINED') b.declined++;
    if (r.status === 'PENDING') b.pending++;
  }
  const submissionTrends = Array.from(trendsMap.values()).sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalProperties: properties.length,
    propertyStatusCounts,
    marketplaceVolume: { forSale: forSaleCount, forRent: forRentCount, unlisted: unlistedCount },
    userStatusCounts,
    totalUsers: users.length,
    submissionTrends,
  };
}

module.exports = {
  listRequests, approveRequest, declineRequest,
  listUsers, listPendingKyc, getKycDocument, approveKyc, rejectKyc,
  getAnalytics,
};
