import express from 'express';
import * as controller from '../controllers/propertyFeature.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyFeatureSchema, updatePropertyFeatureSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/:propertyId/features', verifyToken, validate(createPropertyFeatureSchema), controller.createPropertyFeature);
router.get('/:propertyId/features', controller.getPropertyFeatures);
router.get('/features/:featureId', controller.getPropertyFeatureById);
router.put('/features/:featureId', verifyToken, validate(updatePropertyFeatureSchema), controller.updatePropertyFeature);
router.delete('/features/:featureId', verifyToken, controller.deletePropertyFeature);

export default router;
