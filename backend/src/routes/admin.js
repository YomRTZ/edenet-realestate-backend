// src/routes/admin.js
// All routes require: 1) valid JWT (auth), 2) government wallet (requireAdmin).
// auth runs first → single DB lookup → requireAdmin checks the wallet in memory.

const express      = require('express');
const router       = express.Router();
const adminController = require('../controllers/adminController');
const auth         = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const { validate } = require('../middleware/validate');
const {
  approveRequestSchema,
  declineRequestSchema,
  rejectKycSchema,
  listRequestsQuerySchema,
} = require('../validation/adminSchemas');

// Compose auth + admin check once
const adminGuard = [auth, requireAdmin];

// ── Property requests ──────────────────────────────────────────────────────
router.get('/requests',
  ...adminGuard,
  validate(listRequestsQuerySchema, { source: 'query' }),
  adminController.listRequests
);
router.post('/approve/:requestId',
  ...adminGuard,
  validate(approveRequestSchema),
  adminController.approveRequest
);
router.post('/decline/:requestId',
  ...adminGuard,
  validate(declineRequestSchema),
  adminController.declineRequest
);

// ── Users ──────────────────────────────────────────────────────────────────
router.get('/users',    ...adminGuard, adminController.listUsers);

// ── KYC review ────────────────────────────────────────────────────────────
router.get('/kyc/pending',                  ...adminGuard, adminController.listPendingKyc);
router.get('/kyc/:userId/documents/:docId', ...adminGuard, adminController.getKycDocument);
router.post('/kyc/:userId/approve',         ...adminGuard, adminController.approveKyc);
router.post('/kyc/:userId/reject',
  ...adminGuard,
  validate(rejectKycSchema),
  adminController.rejectKyc
);

// ── Analytics ──────────────────────────────────────────────────────────────
router.get('/analytics', ...adminGuard, adminController.getAnalytics);

module.exports = router;
