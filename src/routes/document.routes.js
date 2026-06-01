import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadDocumentFile } from '../middlewares/upload.middleware.js';
import * as controller from '../controllers/document.controller.js';

const router = express.Router();

router.post('/users/:userId/documents', verifyToken, uploadDocumentFile, controller.uploadUserDocument);
router.post('/properties/:propertyId/documents', verifyToken, uploadDocumentFile, controller.uploadPropertyDocument);
router.get('/documents/:id/file', verifyToken, controller.streamDecryptedDocument);

export default router;
