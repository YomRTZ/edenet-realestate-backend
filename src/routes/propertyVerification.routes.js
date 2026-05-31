import express from 'express';
import * as controller from '../controllers/propertyVerification.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyVerificationSchema, updatePropertyVerificationSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/:propertyId/verifications', verifyToken, validate(createPropertyVerificationSchema), controller.createPropertyVerification);
router.get('/:propertyId/verifications', controller.getPropertyVerifications);
router.get('/verifications/:verificationId', controller.getPropertyVerificationById);
router.put('/verifications/:verificationId', verifyToken, validate(updatePropertyVerificationSchema), controller.updatePropertyVerification);
router.delete('/verifications/:verificationId', verifyToken, controller.deletePropertyVerification);

export default router;
