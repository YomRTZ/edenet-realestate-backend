import express from 'express';
import * as controller from '../controllers/propertyView.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertyViewSchema } from '../utils/validators.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/views', validate(createPropertyViewSchema), controller.createPropertyView);
router.get('/:propertyId/views', controller.getPropertyViews);
router.get('/user/:userId/views', verifyToken, controller.getUserViews);

export default router;
