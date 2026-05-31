import express from 'express';
import * as controller from '../controllers/favorite.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { addFavoriteSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/favorites', verifyToken, validate(addFavoriteSchema), controller.addFavorite);
router.get('/user/:userId/favorites', controller.getUserFavorites);
router.get('/:propertyId/favorites', controller.getPropertyFavorites);
router.delete('/:propertyId/favorites', verifyToken, validate(addFavoriteSchema), controller.removeFavorite);
router.get('/:propertyId/favorites/check', verifyToken, validate(addFavoriteSchema), controller.isFavorited);

export default router;
