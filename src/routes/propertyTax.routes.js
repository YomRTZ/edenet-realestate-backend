import express from 'express';
import * as controller from '../controllers/propertyTax.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyTaxSchema, updatePropertyTaxSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/property-taxes', verifyToken, validate(createPropertyTaxSchema), controller.createPropertyTax);
router.get('/:propertyId/property-taxes', controller.getPropertyTaxes);
router.get('/property-taxes/:taxId', controller.getPropertyTaxById);
router.put('/property-taxes/:taxId', verifyToken, validate(updatePropertyTaxSchema), controller.updatePropertyTax);
router.delete('/property-taxes/:taxId', verifyToken, controller.deletePropertyTax);

export default router;
