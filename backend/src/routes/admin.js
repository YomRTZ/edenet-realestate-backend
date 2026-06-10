// src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAdmin = require('../middleware/requireAdmin');

// Property requests
router.get('/requests',               requireAdmin, adminController.listRequests);
router.post('/approve/:requestId',    requireAdmin, adminController.approveRequest);
router.post('/decline/:requestId',    requireAdmin, adminController.declineRequest);

// Users
router.get('/users',                  requireAdmin, adminController.listUsers);

// KYC review
router.get('/kyc/pending',                          requireAdmin, adminController.listPendingKyc);
router.get('/kyc/:userId/documents/:docId',         requireAdmin, adminController.getKycDocument);
router.post('/kyc/:userId/approve',                 requireAdmin, adminController.approveKyc);
router.post('/kyc/:userId/reject',                  requireAdmin, adminController.rejectKyc);

// Analytics
router.get('/analytics',              requireAdmin, adminController.getAnalytics);

module.exports = router;
