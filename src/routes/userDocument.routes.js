import express from 'express';
import * as controller from '../controllers/userDocument.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createUserDocumentSchema, updateUserDocumentSchema, verifyUserDocumentSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/users/:userId/documents', verifyToken, validate(createUserDocumentSchema), controller.createUserDocument);
router.get('/users/:userId/documents', verifyToken, controller.getUserDocuments);
router.get('/users/documents/:documentId', verifyToken, controller.getUserDocumentById);
router.put('/users/documents/:documentId', verifyToken, validate(updateUserDocumentSchema), controller.updateUserDocument);
router.delete('/users/documents/:documentId', verifyToken, controller.deleteUserDocument);
router.post('/users/documents/:documentId/verify', verifyToken, validate(verifyUserDocumentSchema), controller.verifyUserDocument);

export default router;
