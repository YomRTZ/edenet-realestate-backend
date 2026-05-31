import express from 'express';
import * as controller from '../controllers/propertyDocument.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyDocumentSchema, updatePropertyDocumentSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/:propertyId/documents', verifyToken, validate(createPropertyDocumentSchema), controller.createPropertyDocument);
router.get('/:propertyId/documents', controller.getPropertyDocuments);
router.get('/documents/:documentId', controller.getPropertyDocumentById);
router.put('/documents/:documentId', verifyToken, validate(updatePropertyDocumentSchema), controller.updatePropertyDocument);
router.delete('/documents/:documentId', verifyToken, controller.deletePropertyDocument);

export default router;
