// src/routes/properties.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');
const requireKyc = require('../middleware/requireKyc');
const { uploadPropertyFiles } = require('../middleware/upload');

// Two-step mint flow
router.post('/request/prepare',  auth, requireKyc, uploadPropertyFiles, propertyController.prepareRequest);
router.post('/request/confirm',  auth, requireKyc,                      propertyController.confirmRequest);

// Update request
router.post('/:id/update-request', auth, requireKyc, uploadPropertyFiles, propertyController.submitUpdateRequest);

// Public listing + detail
router.get('/',            propertyController.listProperties);
router.get('/:id',         propertyController.getPropertyById);
router.get('/:id/images',  propertyController.getImages);
router.get('/:id/documents', propertyController.getDocuments);

module.exports = router;
