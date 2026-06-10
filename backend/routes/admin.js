// routes/admin.jsa
// Government-only routes: approve or decline mint/update requests.
// On approval → DB updated + contract called atomically.

const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { mintPropertyOnChain, approveUpdateOnChain, declineUpdateOnChain, getPropertyNFT, getOnChainListingStatusMap } = require("../utils/contract");
const requireAdmin = require("../middleware/requireAdmin");
const { sendApprovalNotification, sendRejectionNotification } = require("../utils/email");
const { notifyUser, notifyAdmin, notifyUserByWallet } = require("../utils/notifications");

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/requests
// List all pending requests for gov't review
// ─────────────────────────────────────────────────────────────────────────────
router.get("/requests", requireAdmin, async (req, res) => {
  try {
    const { status = "PENDING", type } = req.query;
    const where = { status };
    if (type) where.type = type;

    const requests = await prisma.request.findMany({
      where,
      include: {
        property: {
          select: { id: true, tokenId: true, name: true, location: true, ownerWallet: true },
        },
      },
      orderBy: { submittedAt: "asc" }, // oldest first
      });

            const flattened = requests.map((r) => ({
              ...r,
              name: r.property?.name ?? r.metadataSnapshot?.name ?? null,
              location: r.property?.location ?? r.metadataSnapshot?.location ?? null,
              price: r.metadataSnapshot?.price ?? null,
              tokenId: r.property?.tokenId ?? null,
              propertyId: r.property?.id ?? r.propertyId ?? null,
            }));

            res.json(flattened);
          } catch (err) {
            console.error("[GET /admin/requests]", err);
          res.status(500).json({ error: err.message });
        }
      });

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/approve/:requestId
// Gov't approves a MINT or UPDATE request.
//
// Flow (atomic):
//   1. Fetch the request from DB
//   2. Call the smart contract (mint or approveUpdate)
//   3. If chain call succeeds → update DB (request status, property status/hashes, metadata version)
//   4. If chain call fails → return error, DB stays unchanged
//
// Body (for MINT only):
//   { tokenId: "42" }   ← gov't assigns the token ID
// ─────────────────────────────────────────────────────────────────────────────
router.post("/approve/:requestId", requireAdmin, async (req, res) => {
  const { requestId } = req.params;
  const { onChainRequestId, onChainUpdateIndex } = req.body; // only needed for MINT

  try {
    // Use wallet from authenticated user
    const govWallet = req.user.walletAddress.toLowerCase();
    // 1. Fetch request
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { property: true },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "PENDING") {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    const { metadataHash, imagesRootHash, documentsRootHash } = request;

    // ── MINT request ──────────────────────────────────────────────────────────
    if (request.type === "MINT") {
      if (onChainRequestId === undefined || onChainRequestId === null) {
        return res.status(400).json({ error: "onChainRequestId is required" });
      }

      // 2a. Call contract
      let receipt;
      try {
        // requestId here is the on-chain request index (0, 1, 2...)
        // tokenId from body is used as the on-chain requestId
        receipt = await mintPropertyOnChain(onChainRequestId);
        } catch (chainErr) {
          console.error("[chain] mintProperty failed:", chainErr.message);
          return res.status(502).json({ error: "Blockchain call failed: " + chainErr.message });
        }

        // Extract minted tokenId from RequestApproved event
        let mintedTokenId = onChainRequestId.toString(); // fallback
        try {
          const approvedEvent = receipt.events?.find(e => e.event === "RequestApproved");
          if (approvedEvent) {
            mintedTokenId = approvedEvent.args.propertyId.toString();
          }
        } catch (_) {}

      // 3a. Update DB (only runs if chain succeeded)

      // 3a. Update DB (only runs if chain succeeded)
      await prisma.$transaction([
        // Update request status
        prisma.request.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            reviewedBy: govWallet,
            reviewedAt: new Date(),
          },
        }),
        // Update property: assign real tokenId, mark as MINTED
        prisma.property.update({
          where: { id: request.propertyId },
          data: {
            tokenId: mintedTokenId,
            status: "MINTED",
            chainHash: metadataHash,
          },
        }),
        // Create first metadata version entry
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

      notifyUserByWallet(request.submittedBy, 'PROPERTY_APPROVED', 'Property approved', `Your property listing has been minted on-chain (token #${mintedTokenId}).`, '/dashboard/my-properties');

        return res.json({
          message: "Mint request approved",
          tokenId: mintedTokenId,
          txHash: receipt.transactionHash,
        });
      }

    // ── UPDATE request ────────────────────────────────────────────────────────
    if (request.type === "UPDATE") {
      const property = request.property;
      if (!property || property.status !== "MINTED") {
        return res.status(400).json({ error: "Property is not minted yet" });
      }

      // Get new version number for DB
      const lastVersion = await prisma.metadataVersion.findFirst({
        where: { propertyId: request.propertyId },
        orderBy: { versionNo: "desc" },
      });
      const newVersionNo = lastVersion ? lastVersion.versionNo + 1 : 2;

      // Find the correct pending update index on-chain
      const onChainUpdates = await getPropertyNFT().getUpdateRequests(property.tokenId);
      console.log("[update] tokenId:", property.tokenId);
      console.log("[update] total updates on-chain:", onChainUpdates.length);
      onChainUpdates.forEach((u, i) => {
        console.log(`[update] index ${i} status:`, Number(u.status));
      });
      let pendingIndex = -1;
      for (let i = 0; i < onChainUpdates.length; i++) {
        if (Number(onChainUpdates[i].status) === 0) { // 0 = Pending
          pendingIndex = i;
          break;
        }
      }
      console.log("[update] pendingIndex found:", pendingIndex);
      if (pendingIndex === -1) {
        return res.status(400).json({ error: "No pending update request found on-chain" });
      }


      // 2b. Call contract
      let receipt;
      try {
        receipt = await approveUpdateOnChain(property.tokenId, pendingIndex);
      } catch (chainErr) {
        console.error("[chain] approveUpdateRequest failed:", chainErr.message);
        return res.status(502).json({ error: "Blockchain call failed: " + chainErr.message });
      }

      // 3b. Update DB
      await prisma.$transaction([
        prisma.request.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            reviewedBy: govWallet,
            reviewedAt: new Date(),
          },
        }),
        prisma.property.update({
          where: { id: request.propertyId },
          data: {
            metadataHash,
            imagesRootHash,
            documentsRootHash,
            chainHash: metadataHash,
            // Update all searchable fields from the approved metadata snapshot
            name:         request.metadataSnapshot.name,
            location:     request.metadataSnapshot.location,
            propertyType: request.metadataSnapshot.propertyType,
            bedrooms:     request.metadataSnapshot.bedrooms,
            bathrooms:    request.metadataSnapshot.bathrooms,
            squareFeet:   request.metadataSnapshot.squareFeet,
            parking:      request.metadataSnapshot.parking   ?? undefined,
            floors:       request.metadataSnapshot.floors    ?? undefined,
            yearBuilt:    request.metadataSnapshot.yearBuilt ?? undefined,
            price:        request.metadataSnapshot.price,
            description:  request.metadataSnapshot.description ?? undefined,
          },
        }),
        prisma.metadataVersion.create({
          data: {
            propertyId: request.propertyId,
            versionNo: newVersionNo,
            metadataHash,
            imagesRootHash,
            documentsRootHash,
            metadataSnapshot: request.metadataSnapshot,
            approvedBy: govWallet,
          },
        }),
      ]);

      notifyUserByWallet(request.submittedBy, 'PROPERTY_UPDATE_APPROVED', 'Property update approved', `Your update to the property listing has been approved (version ${newVersionNo}).`, '/dashboard/my-properties');

        return res.json({
          message: "Update request approved",
          newVersion: newVersionNo,
          txHash: receipt.transactionHash,
        });
      }

    res.status(400).json({ error: "Unknown request type" });
  } catch (err) {
    console.error("[POST /admin/approve/:requestId]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/decline/:requestId
// Gov't declines a request — no chain call needed.
// Body: { reason: "Missing documents" }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/decline/:requestId", requireAdmin, async (req, res) => {
  const { requestId } = req.params;
  const { reason, updateIndex } = req.body;

  try {
    // Use wallet from authenticated user
    const govWallet = req.user.walletAddress.toLowerCase();
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: { property: true },
    });
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "PENDING") {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    // ── For UPDATE requests: decline on-chain FIRST so chain + DB stay in sync ──
    if (request.type === "UPDATE") {
      const property = request.property;
      if (!property || property.status !== "MINTED") {
        return res.status(400).json({ error: "Property is not minted — cannot decline update on-chain" });
      }

      // Resolve the on-chain update index:
      // Prefer the index sent by the frontend; fall back to scanning for the first Pending slot.
      let pendingIndex = typeof updateIndex === "number" ? updateIndex : -1;
      if (pendingIndex === -1) {
        const onChainUpdates = await getPropertyNFT().getUpdateRequests(property.tokenId);
        console.log("[decline UPDATE] scanning on-chain updates for property", property.tokenId, "count:", onChainUpdates.length);
        for (let i = 0; i < onChainUpdates.length; i++) {
          if (Number(onChainUpdates[i].status) === 0) { // 0 = Pending
            pendingIndex = i;
            break;
          }
        }
      }

      if (pendingIndex === -1) {
        // No pending slot found on-chain — the request may have already been resolved.
        // Still mark DB as declined but log a warning.
        console.warn("[decline UPDATE] No pending on-chain update found for property", property.tokenId, "— declining DB only");
      } else {
        try {
          await declineUpdateOnChain(property.tokenId, pendingIndex, reason || "");
        } catch (chainErr) {
          console.error("[chain] declineUpdateRequest failed:", chainErr.message);
          return res.status(502).json({ error: "Blockchain call failed: " + chainErr.message });
        }
      }
    }

    // ── Update DB ──
    await prisma.$transaction([
      prisma.request.update({
        where: { id: requestId },
        data: {
          status: "DECLINED",
          reviewedBy: govWallet,
          reviewedAt: new Date(),
          declineReason: reason || null,
        },
      }),
      // If it was a MINT request, mark the property as DECLINED too
      ...(request.type === "MINT" && request.propertyId
        ? [
            prisma.property.update({
              where: { id: request.propertyId },
              data: { status: "DECLINED" },
            }),
          ]
        : []),
    ]);

    notifyUserByWallet(request.submittedBy, 'PROPERTY_DECLINED', 'Property request declined', reason || 'Your property request was declined.', '/dashboard/my-requests');

    res.json({ message: "Request declined", requestId, reason });
  } catch (err) {
    console.error("[POST /admin/decline/:requestId]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// KYC ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * List ALL users with their KYC documents and status
 */
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        kycDocuments: {
          select: {
            id: true,
            docType: true,
            status: true,
            reviewedAt: true,
            reviewedBy: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const govWallet = (process.env.GOV_WALLET || '').toLowerCase();
    const result = users.map((u) => ({
      id: u.id,
      email: u.email,
      status: u.status,
      walletAddress: u.walletAddress,
      authProvider: u.authProvider,
      createdAt: u.createdAt,
      role: u.walletAddress && u.walletAddress.toLowerCase() === govWallet ? 'GOVERNMENT' : 'CITIZEN',
      kycDocuments: u.kycDocuments
    }));

    res.json(result);
  } catch (err) {
    console.error("[GET /admin/users]", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/kyc/pending
 * List all users with PENDING_APPROVAL status
 */
router.get("/kyc/pending", requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { status: "PENDING_APPROVAL" },
      select: {
        id: true,
        email: true,
        createdAt: true,
        kycDocuments: {
          select: {
            id: true,
            docType: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    res.json(pendingUsers);
  } catch (err) {
    console.error("[GET /admin/kyc/pending]", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/kyc/:userId/documents/:docId
 * Stream a KYC document image for review
 */
router.get("/kyc/:userId/documents/:docId", requireAdmin, async (req, res) => {
  try {
    const { userId, docId } = req.params;

    // Verify the document belongs to the specified user
    const document = await prisma.kycDocument.findFirst({
      where: {
        id: docId,
        userId: userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Set appropriate headers and stream the image
    res.setHeader("Content-Type", "image/jpeg"); // Assuming JPEG, adjust if needed
    res.setHeader("Content-Length", document.fileData.length);
    res.send(document.fileData);
  } catch (err) {
    console.error("[GET /admin/kyc/:userId/documents/:docId]", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/kyc/:userId/approve
 * Approve a user's KYC application
 */
router.post("/kyc/:userId/approve", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.status !== "PENDING_APPROVAL") {
      return res.status(400).json({ 
        error: `Cannot approve user with status ${user.status}` 
      });
    }

    // Update user and all documents
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { status: "ACTIVE" }
      }),
      prisma.kycDocument.updateMany({
        where: { userId: userId },
        data: {
          status: "APPROVED",
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        }
      })
    ]);

// Send approval email
      try {
        await sendApprovalNotification(user.email);
      } catch (emailErr) {
        console.error("Failed to send approval email:", emailErr);
        // Don't fail the request if email fails
      }

      notifyUser(user.id, 'KYC_APPROVED', 'Identity verified', 'Your account has been approved. You can now connect your wallet.', '/dashboard');

    res.json({
      message: "User approved successfully",
      userId: user.id,
      email: user.email
    });
  } catch (err) {
    console.error("[POST /admin/kyc/:userId/approve]", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/kyc/:userId/reject
 * Reject a user's KYC application
 */
router.post("/kyc/:userId/reject", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.status !== "PENDING_APPROVAL") {
      return res.status(400).json({ 
        error: `Cannot reject user with status ${user.status}` 
      });
    }

    // Update user and all documents
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { status: "REJECTED" }
      }),
      prisma.kycDocument.updateMany({
        where: { userId: userId },
        data: {
          status: "REJECTED",
          reviewedBy: req.user.id,
          reviewedAt: new Date()
        }
      })
    ]);

// Send rejection email
      try {
        await sendRejectionNotification(user.email, reason);
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr);
        // Don't fail the request if email fails
      }

      notifyUser(user.id, 'KYC_REJECTED', 'Identity verification declined', reason || 'Your KYC application was rejected.', '/kyc/pending');

    res.json({
      message: "User rejected",
      userId: user.id,
      email: user.email,
      reason
    });
  } catch (err) {
    console.error("[POST /admin/kyc/:userId/reject]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/analytics
// Aggregated system-wide metrics for the admin analytics dashboard.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/analytics", requireAdmin, async (req, res) => {
  try {
    const [
      properties,
      requests,
      users,
    ] = await Promise.all([
      prisma.property.findMany({
        select: { tokenId: true, status: true, isForRent: true, createdAt: true },
      }),
      prisma.request.findMany({
        select: { type: true, status: true, submittedAt: true },
      }),
      prisma.user.findMany({
        select: { status: true, createdAt: true },
      }),
    ]);

    // ── Property status breakdown ──
    const propertyStatusCounts = { PENDING: 0, MINTED: 0, DECLINED: 0 };
    for (const p of properties) {
      if (propertyStatusCounts[p.status] != null) propertyStatusCounts[p.status]++;
    }

    // ── Marketplace volume ──
    // isForSale lives on-chain only — read it per-token and merge with DB isForRent.
    let listingStatusMap = {};
    try {
      listingStatusMap = await getOnChainListingStatusMap();
    } catch (err) {
      console.error("[GET /admin/analytics] Could not read on-chain listing status:", err.message);
    }

    const minted = properties.filter((p) => p.status === "MINTED");
    let forSaleCount = 0;
    let forRentCount = 0;
    let unlistedCount = 0;
    for (const p of minted) {
      const chainStatus = listingStatusMap[p.tokenId];
      const isForSale = chainStatus ? chainStatus.isForSale : false;
      const isForRent = p.isForRent;
      if (isForSale) forSaleCount++;
      if (isForRent) forRentCount++;
      if (!isForSale && !isForRent) unlistedCount++;
    }
    const marketplaceVolume = {
      forSale: forSaleCount,
      forRent: forRentCount,
      unlisted: unlistedCount,
    };

    // ── User status breakdown ──
    const userStatusCounts = {
      PENDING_EMAIL: 0,
      PENDING_KYC: 0,
      PENDING_APPROVAL: 0,
      ACTIVE: 0,
      REJECTED: 0,
    };
    for (const u of users) {
      if (userStatusCounts[u.status] != null) userStatusCounts[u.status]++;
    }

    // ── Submission trends over time (by month) ──
    function monthKey(date) {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    const trendsMap = new Map(); // monthKey -> { mint, update, approved, declined, pending }
    for (const r of requests) {
      const key = monthKey(r.submittedAt);
      if (!trendsMap.has(key)) {
        trendsMap.set(key, { month: key, mint: 0, update: 0, approved: 0, declined: 0, pending: 0 });
      }
      const bucket = trendsMap.get(key);
      if (r.type === "MINT") bucket.mint++;
      if (r.type === "UPDATE") bucket.update++;
      if (r.status === "APPROVED") bucket.approved++;
      if (r.status === "DECLINED") bucket.declined++;
      if (r.status === "PENDING") bucket.pending++;
    }
    const submissionTrends = Array.from(trendsMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    res.json({
      totalProperties: properties.length,
      propertyStatusCounts,
      marketplaceVolume,
      userStatusCounts,
      totalUsers: users.length,
      submissionTrends,
    });
  } catch (err) {
    console.error("[GET /admin/analytics]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
