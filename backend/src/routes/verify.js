// src/routes/verify.js
// Public tamper-proof audit endpoint — no auth required.
const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');

router.get('/:tokenId', verifyController.verifyProperty);

module.exports = router;
