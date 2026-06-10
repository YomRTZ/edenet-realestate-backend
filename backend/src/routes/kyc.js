// src/routes/kyc.js
const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const auth = require('../middleware/auth');
const { uploadKycFiles } = require('../middleware/upload');

router.post('/upload', auth, uploadKycFiles, kycController.upload);
router.get('/status',  auth,                kycController.getStatus);

module.exports = router;
