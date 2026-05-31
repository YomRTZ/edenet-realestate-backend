import express from 'express';
import * as controller from '../controllers/userReview.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createUserReviewSchema, updateUserReviewSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:revieweeId/user-reviews', verifyToken, validate(createUserReviewSchema), controller.createUserReview);
router.get('/:revieweeId/user-reviews', controller.getUserReviews);
router.get('/user-reviews/:reviewId', controller.getUserReviewById);
router.put('/user-reviews/:reviewId', verifyToken, validate(updateUserReviewSchema), controller.updateUserReview);
router.delete('/user-reviews/:reviewId', verifyToken, controller.deleteUserReview);

export default router;
