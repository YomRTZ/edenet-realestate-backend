import express from 'express';
import * as controller from '../controllers/propertyReview.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyReviewSchema, updatePropertyReviewSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/property-reviews', verifyToken, validate(createPropertyReviewSchema), controller.createPropertyReview);
router.get('/:propertyId/property-reviews', controller.getPropertyReviews);
router.get('/property-reviews/:reviewId', controller.getPropertyReviewById);
router.put('/property-reviews/:reviewId', verifyToken, validate(updatePropertyReviewSchema), controller.updatePropertyReview);
router.delete('/property-reviews/:reviewId', verifyToken, controller.deletePropertyReview);

export default router;
