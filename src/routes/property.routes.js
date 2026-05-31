import express from 'express';
import * as controller from '../controllers/property.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPropertySchema, updatePropertySchema } from '../utils/validators.js';

const router = express.Router();

/* Create property (authenticated) */
router.post('/', verifyToken, validate(createPropertySchema), controller.createProperty);

/* Get all properties */
router.get('/', controller.getProperties);

/* Get user's properties (authenticated) */
router.get('/user/my-properties', verifyToken, controller.getUserProperties);

/* Get property by ID */
router.get('/:id', controller.getPropertyById);

/* Update property (authenticated) */
router.put('/:id', verifyToken, validate(updatePropertySchema), controller.updateProperty);

/* Delete property (authenticated) */
router.delete('/:id', verifyToken, controller.deleteProperty);

export default router;
