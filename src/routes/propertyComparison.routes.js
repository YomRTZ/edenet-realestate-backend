import express from 'express';
import * as controller from '../controllers/propertyComparison.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyComparisonSchema, updatePropertyComparisonSchema, addPropertyToComparisonSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/users/:userId/property-comparisons', verifyToken, validate(createPropertyComparisonSchema), controller.createPropertyComparison);
router.get('/users/:userId/property-comparisons', controller.getUserPropertyComparisons);
router.get('/property-comparisons/:comparisonId', controller.getPropertyComparisonById);
router.get('/property-comparisons/:comparisonId/details', controller.getPropertyComparisonWithDetails);
router.put('/property-comparisons/:comparisonId', verifyToken, validate(updatePropertyComparisonSchema), controller.updatePropertyComparison);
router.delete('/property-comparisons/:comparisonId', verifyToken, controller.deletePropertyComparison);
router.post('/property-comparisons/:comparisonId/add-property', verifyToken, validate(addPropertyToComparisonSchema), controller.addPropertyToComparison);
router.delete('/property-comparisons/:comparisonId/remove-property/:propertyId', verifyToken, controller.removePropertyFromComparison);

export default router;
