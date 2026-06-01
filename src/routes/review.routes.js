import express from 'express';
import * as controller from '../controllers/review.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createReviewSchema, updateReviewSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/users/:revieweeId/user-reviews', verifyToken, validate(createReviewSchema), controller.createUserReview);
router.get('/users/:revieweeId/user-reviews', controller.getUserReviews);
router.get('/users/user-reviews/:reviewId', controller.getUserReviewById);
router.put('/users/user-reviews/:reviewId', verifyToken, validate(updateReviewSchema), controller.updateUserReview);
router.delete('/users/user-reviews/:reviewId', verifyToken, controller.deleteUserReview);

router.post('/properties/:propertyId/property-reviews', verifyToken, validate(createReviewSchema), controller.createPropertyReview);
router.get('/properties/:propertyId/property-reviews', controller.getPropertyReviews);
router.get('/properties/property-reviews/:reviewId', controller.getPropertyReviewById);
router.put('/properties/property-reviews/:reviewId', verifyToken, validate(updateReviewSchema), controller.updatePropertyReview);
router.delete('/properties/property-reviews/:reviewId', verifyToken, controller.deletePropertyReview);

export default router;
