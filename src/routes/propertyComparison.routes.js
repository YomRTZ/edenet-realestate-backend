import express from 'express';
import * as controller from '../controllers/propertyComparison.controller.js';
const router = express.Router({ mergeParams: true });

// All property comparison routes now return 410 Gone
router.post('/users/:userId/property-comparisons', controller.createPropertyComparison);
router.get('/users/:userId/property-comparisons', controller.getUserPropertyComparisons);
router.get('/property-comparisons/:comparisonId', controller.getPropertyComparisonById);
router.get('/property-comparisons/:comparisonId/details', controller.getPropertyComparisonWithDetails);
router.put('/property-comparisons/:comparisonId', controller.updatePropertyComparison);
router.delete('/property-comparisons/:comparisonId', controller.deletePropertyComparison);
router.post('/property-comparisons/:comparisonId/add-property', controller.addPropertyToComparison);
router.delete('/property-comparisons/:comparisonId/remove-property/:propertyId', controller.removePropertyFromComparison);

export default router;
