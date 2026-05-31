import express from 'express';
import * as controller from '../controllers/savedSearch.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createSavedSearchSchema, updateSavedSearchSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/users/:userId/saved-searches', verifyToken, validate(createSavedSearchSchema), controller.createSavedSearch);
router.get('/users/:userId/saved-searches', controller.getUserSavedSearches);
router.get('/saved-searches/:searchId', controller.getSavedSearchById);
router.put('/saved-searches/:searchId', verifyToken, validate(updateSavedSearchSchema), controller.updateSavedSearch);
router.delete('/saved-searches/:searchId', verifyToken, controller.deleteSavedSearch);
router.get('/saved-searches/frequency/:frequency', controller.getActiveSavedSearchesByFrequency);

export default router;
