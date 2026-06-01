import express from 'express';
import * as controller from '../controllers/propertyView.controller.js';

const router = express.Router({ mergeParams: true });

// All property view routes now return 410 Gone
router.post('/:propertyId/views', controller.createPropertyView);
router.get('/:propertyId/views', controller.getPropertyViews);
router.get('/user/:userId/views', controller.getUserViews);

export default router;
