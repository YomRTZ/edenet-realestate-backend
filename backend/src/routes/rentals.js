// src/routes/rentals.js
const express    = require('express');
const router     = express.Router();
const rentalController = require('../controllers/rentalController');
const auth       = require('../middleware/auth');
const requireKyc = require('../middleware/requireKyc');
const { validate } = require('../middleware/validate');
const {
  listForRentSchema,
  unlistFromRentSchema,
  createRentalSchema,
  payRentSchema,
  terminateRentalSchema,
  finalizeRentalSchema,
} = require('../validation/rentalSchemas');

// Write actions — authenticated + KYC-approved + validated
router.post('/list/:propertyId',      auth, requireKyc, validate(listForRentSchema),      rentalController.listForRent);
router.post('/unlist/:propertyId',    auth, requireKyc, validate(unlistFromRentSchema),    rentalController.unlistFromRent);
router.post('/rent/:propertyId',      auth, requireKyc, validate(createRentalSchema),      rentalController.createRental);
router.post('/pay/:propertyId',       auth, requireKyc, validate(payRentSchema),            rentalController.payRent);
router.post('/terminate/:propertyId', auth, requireKyc, validate(terminateRentalSchema),   rentalController.terminateRental);
router.post('/finalize/:propertyId',  auth, requireKyc, validate(finalizeRentalSchema),    rentalController.finalizeRental);

// Public reads
router.get('/history/:propertyId', rentalController.getRentalHistory);
router.get('/tenant/:wallet',      rentalController.getRentalsByTenant);
router.get('/landlord/:wallet',    rentalController.getRentalsByLandlord);
router.get('/:propertyId',         rentalController.getActiveRental);

module.exports = router;
