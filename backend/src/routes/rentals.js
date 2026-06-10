// src/routes/rentals.js
const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');

// Actions (called after on-chain confirmation)
router.post('/list/:propertyId',       rentalController.listForRent);
router.post('/unlist/:propertyId',     rentalController.unlistFromRent);
router.post('/rent/:propertyId',       rentalController.createRental);
router.post('/pay/:propertyId',        rentalController.payRent);
router.post('/terminate/:propertyId',  rentalController.terminateRental);
router.post('/finalize/:propertyId',   rentalController.finalizeRental);

// Queries
router.get('/history/:propertyId',    rentalController.getRentalHistory);
router.get('/tenant/:wallet',         rentalController.getRentalsByTenant);
router.get('/landlord/:wallet',       rentalController.getRentalsByLandlord);
router.get('/:propertyId',            rentalController.getActiveRental);

module.exports = router;
