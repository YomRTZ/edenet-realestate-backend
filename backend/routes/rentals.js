// routes/rentals.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rentals/list/:propertyId
// Landlord lists property for rent (DB record — chain call done from frontend)
// Body: { wallet, monthlyRent, durationMonths }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/list/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { wallet, monthlyRent, durationMonths } = req.body;

    if (!wallet || !monthlyRent || !durationMonths) {
      return res.status(400).json({ error: "wallet, monthlyRent and durationMonths required" });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: "Property not found" });
    if (property.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "Not the property owner" });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: {
        isForRent: true,
        monthlyRent: String(monthlyRent),
        rentalDuration: Number(durationMonths),
      },
    });

    res.json({ success: true, property: updated });
  } catch (err) {
    console.error("[POST /rentals/list] error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rentals/unlist/:propertyId
// Landlord unlists from rent
// Body: { wallet }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/unlist/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { wallet } = req.body;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: "Property not found" });
    if (property.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "Not the property owner" });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { isForRent: false, monthlyRent: null, rentalDuration: null },
    });

    res.json({ success: true, property: updated });
  } catch (err) {
    console.error("[POST /rentals/unlist] error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rentals/rent/:propertyId
// Called after chain confirms rentProperty()
// Body: { wallet, txHash, monthlyRent, faithDeposit, startTime, endTime, durationMonths }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/rent/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { wallet, txHash, monthlyRent, faithDeposit, startTime, endTime, durationMonths } = req.body;

    if (!wallet || !txHash || !monthlyRent || !faithDeposit || !startTime || !endTime || !durationMonths) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: "Property not found" });

    const [rental] = await prisma.$transaction([
      prisma.rentalAgreement.create({
        data: {
          propertyId,
          tenantWallet: wallet.toLowerCase(),
          landlordWallet: property.ownerWallet.toLowerCase(),
          monthlyRent: String(monthlyRent),
          faithDeposit: String(faithDeposit),
          startTime: new Date(Number(startTime) * 1000),
          endTime: new Date(Number(endTime) * 1000),
          nextPaymentDue: new Date((Number(startTime) + 30 * 24 * 60 * 60) * 1000),
          durationMonths: Number(durationMonths),
          txHash,
          status: "ACTIVE",
        },
      }),
      prisma.property.update({
        where: { id: propertyId },
        data: { isRented: true, isForRent: false },
      }),
    ]);

    res.json({ success: true, rental });
  } catch (err) {
    console.error("[POST /rentals/rent] error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rentals/pay/:propertyId
// Called after chain confirms payRent()
// Body: { wallet, txHash, amount, wasLate, penaltyAmount, nextPaymentDue }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/pay/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { wallet, txHash, amount, wasLate, penaltyAmount, nextPaymentDue } = req.body;

    const rental = await prisma.rentalAgreement.findFirst({
      where: { propertyId, status: "ACTIVE" },
    });
    if (!rental) return res.status(404).json({ error: "No active rental" });
    if (rental.tenantWallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "Not the tenant" });
    }

    const [payment] = await prisma.$transaction([
      prisma.rentPayment.create({
        data: {
          rentalId: rental.id,
          amount: String(amount),
          wasLate: Boolean(wasLate),
          penaltyAmount: penaltyAmount ? String(penaltyAmount) : null,
          txHash,
        },
      }),
      prisma.rentalAgreement.update({
        where: { id: rental.id },
        data: { nextPaymentDue: new Date(Number(nextPaymentDue) * 1000) },
      }),
    ]);

    res.json({ success: true, payment });
  } catch (err) {
    console.error("[POST /rentals/pay] error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rentals/terminate/:propertyId
// Called after chain confirms any termination
// Body: { wallet, txHash, reason, terminatedBy }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/terminate/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { wallet, txHash, reason, terminatedBy } = req.body;

    const rental = await prisma.rentalAgreement.findFirst({
      where: { propertyId, status: "ACTIVE" },
    });
    if (!rental) return res.status(404).json({ error: "No active rental" });

    // reason contains "default" → DEFAULTED, otherwise ENDED
    const newStatus = reason && reason.toLowerCase().includes("default") ? "DEFAULTED" : "ENDED";

    const [updated] = await prisma.$transaction([
      prisma.rentalAgreement.update({
        where: { id: rental.id },
        data: {
          status: newStatus,
          terminatedBy: wallet ? wallet.toLowerCase() : null,
          terminationReason: reason || null,
          txHash: txHash || null,
        },
      }),
      prisma.property.update({
        where: { id: propertyId },
        data: { isRented: false },
      }),
    ]);

    res.json({ success: true, rental: updated });
  } catch (err) {
    console.error("[POST /rentals/terminate] error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rentals/finalize/:propertyId
// Called after chain confirms finalizeExpiredRental()
// Body: { wallet, txHash }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/finalize/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { txHash } = req.body;

    const rental = await prisma.rentalAgreement.findFirst({
      where: { propertyId, status: "ACTIVE" },
    });
    if (!rental) return res.status(404).json({ error: "No active rental" });

    const [updated] = await prisma.$transaction([
      prisma.rentalAgreement.update({
        where: { id: rental.id },
        data: { status: "ENDED", terminationReason: "expired", txHash: txHash || null },
      }),
      prisma.property.update({
        where: { id: propertyId },
        data: { isRented: false },
      }),
    ]);

    res.json({ success: true, rental: updated });
  } catch (err) {
    console.error("[POST /rentals/finalize] error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/rentals/:propertyId  — active rental agreement
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:propertyId", async (req, res) => {
  try {
    const rental = await prisma.rentalAgreement.findFirst({
      where: { propertyId: req.params.propertyId, status: "ACTIVE" },
      include: { payments: true },
    });
    res.json({ rental: rental || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/rentals/history/:propertyId  — all rentals for property
// ─────────────────────────────────────────────────────────────────────────────
router.get("/history/:propertyId", async (req, res) => {
  try {
    const rentals = await prisma.rentalAgreement.findMany({
      where: { propertyId: req.params.propertyId },
      include: { payments: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ rentals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/rentals/tenant/:wallet  — all rentals where tenant
// ─────────────────────────────────────────────────────────────────────────────
router.get("/tenant/:wallet", async (req, res) => {
  try {
    const rentals = await prisma.rentalAgreement.findMany({
      where: { tenantWallet: req.params.wallet.toLowerCase() },
      include: { property: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ rentals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/rentals/landlord/:wallet  — all rentals where landlord
// ─────────────────────────────────────────────────────────────────────────────
router.get("/landlord/:wallet", async (req, res) => {
  try {
    const rentals = await prisma.rentalAgreement.findMany({
      where: { landlordWallet: req.params.wallet.toLowerCase() },
      include: { property: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ rentals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
