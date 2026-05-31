import express from 'express';
import * as controller from '../controllers/propertyImage.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { uploadPropertyImageSchema, updatePropertyImageSchema } from '../utils/validators.js';

const router = express.Router();

/* Upload image for property (authenticated) */
router.post('/:propertyId/images', verifyToken, validate(uploadPropertyImageSchema), controller.uploadPropertyImage);

/* Get all images for property */
router.get('/:propertyId/images', controller.getPropertyImages);

/* Get specific image */
router.get('/images/:imageId', controller.getImageById);

/* Update image (authenticated) */
router.put('/images/:imageId', verifyToken, validate(updatePropertyImageSchema), controller.updatePropertyImage);

/* Delete image (authenticated) */
router.delete('/images/:imageId', verifyToken, controller.deletePropertyImage);

/* Set primary image (authenticated) */
router.patch('/:propertyId/images/:imageId/primary', verifyToken, controller.setPrimaryImage);

export default router;
