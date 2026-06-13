// src/routes/properties.js
const express    = require('express');
const router     = express.Router();
const propertyController = require('../controllers/propertyController');
const auth       = require('../middleware/auth');
const requireKyc = require('../middleware/requireKyc');
const { uploadPropertyFiles } = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const {
  confirmRequestSchema,
  listPropertiesQuerySchema,
  propertyDetailsSchema,
} = require('../validation/propertySchemas');

// Two-step mint flow
// prepare: multipart form — propertyDetailsSchema validates req.body after multer parses it
router.post(
  '/request/prepare',
  auth, requireKyc, uploadPropertyFiles,
  validate(propertyDetailsSchema),
  propertyController.prepareRequest
);
router.post(
  '/request/confirm',
  auth, requireKyc,
  validate(confirmRequestSchema),
  propertyController.confirmRequest
);

// Update request: same multipart form as prepare
router.post(
  '/:id/update-request',
  auth, requireKyc, uploadPropertyFiles,
  validate(propertyDetailsSchema),
  propertyController.submitUpdateRequest
);

// Public listing + detail
router.get('/',              validate(listPropertiesQuerySchema, { source: 'query' }), propertyController.listProperties);
router.get('/:id',           propertyController.getPropertyById);
router.get('/:id/images',    propertyController.getImages);
router.get('/:id/documents', propertyController.getDocuments);

module.exports = router;
