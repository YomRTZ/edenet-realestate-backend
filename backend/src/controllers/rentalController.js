// Thin HTTP layer — delegates all logic to rentalService.

const rentalService = require('../services/rentalService');

async function listForRent(req, res, next) {
  try {
    const { wallet, monthlyRent, durationMonths } = req.body;
    const updated = await rentalService.listForRent(req.params.propertyId, wallet, monthlyRent, durationMonths);
    res.json({ success: true, property: updated });
  } catch (err) {
    next(err);
  }
}

async function unlistFromRent(req, res, next) {
  try {
    const updated = await rentalService.unlistFromRent(req.params.propertyId, req.body.wallet);
    res.json({ success: true, property: updated });
  } catch (err) {
    next(err);
  }
}

async function createRental(req, res, next) {
  try {
    const rental = await rentalService.createRental(req.params.propertyId, req.body);
    res.json({ success: true, rental });
  } catch (err) {
    next(err);
  }
}

async function payRent(req, res, next) {
  try {
    const payment = await rentalService.payRent(req.params.propertyId, req.body);
    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
}

async function terminateRental(req, res, next) {
  try {
    const rental = await rentalService.terminateRental(req.params.propertyId, req.body);
    res.json({ success: true, rental });
  } catch (err) {
    next(err);
  }
}

async function finalizeRental(req, res, next) {
  try {
    const rental = await rentalService.finalizeRental(req.params.propertyId, req.body.txHash);
    res.json({ success: true, rental });
  } catch (err) {
    next(err);
  }
}

async function getActiveRental(req, res, next) {
  try {
    const rental = await rentalService.getActiveRental(req.params.propertyId);
    res.json({ rental: rental || null });
  } catch (err) {
    next(err);
  }
}

async function getRentalHistory(req, res, next) {
  try {
    const rentals = await rentalService.getRentalHistory(req.params.propertyId);
    res.json({ rentals });
  } catch (err) {
    next(err);
  }
}

async function getRentalsByTenant(req, res, next) {
  try {
    const rentals = await rentalService.getRentalsByTenant(req.params.wallet);
    res.json({ rentals });
  } catch (err) {
    next(err);
  }
}

async function getRentalsByLandlord(req, res, next) {
  try {
    const rentals = await rentalService.getRentalsByLandlord(req.params.wallet);
    res.json({ rentals });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listForRent, unlistFromRent, createRental, payRent,
  terminateRental, finalizeRental,
  getActiveRental, getRentalHistory, getRentalsByTenant, getRentalsByLandlord,
};
