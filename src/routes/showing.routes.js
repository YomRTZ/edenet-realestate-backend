import express from 'express';
import * as controller from '../controllers/showing.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createShowingSchema, updateShowingSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/:propertyId/showings', verifyToken, validate(createShowingSchema), controller.createShowing);
router.get('/:propertyId/showings', controller.getShowings);
router.get('/showings/:showingId', controller.getShowingById);
router.put('/showings/:showingId', verifyToken, validate(updateShowingSchema), controller.updateShowing);
router.delete('/showings/:showingId', verifyToken, controller.deleteShowing);

export default router;
