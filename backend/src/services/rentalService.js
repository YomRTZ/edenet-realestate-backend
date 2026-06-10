// src/services/rentalService.js
// Business logic for rental listing, renting, paying, and termination.

const prisma = require('../config/db');

async function listForRent(propertyId, wallet, monthlyRent, durationMonths) {
  if (!wallet || !monthlyRent || !durationMonths) {
    throw Object.assign(new Error('wallet, monthlyRent and durationMonths required'), { status: 400 });
  }
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw Object.assign(new Error('Property not found'), { status: 404 });
  if (property.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
    throw Object.assign(new Error('Not the property owner'), { status: 403 });
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: { isForRent: true, monthlyRent: String(monthlyRent), rentalDuration: Number(durationMonths) },
  });
}

async function unlistFromRent(propertyId, wallet) {
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw Object.assign(new Error('Property not found'), { status: 404 });
  if (property.ownerWallet.toLowerCase() !== wallet.toLowerCase()) {
    throw Object.assign(new Error('Not the property owner'), { status: 403 });
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: { isForRent: false, monthlyRent: null, rentalDuration: null },
  });
}

async function createRental(propertyId, body) {
  const { wallet, txHash, monthlyRent, faithDeposit, startTime, endTime, durationMonths } = body;
  if (!wallet || !txHash || !monthlyRent || !faithDeposit || !startTime || !endTime || !durationMonths) {
    throw Object.assign(new Error('Missing required fields'), { status: 400 });
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw Object.assign(new Error('Property not found'), { status: 404 });

  const [rental] = await prisma.$transaction([
    prisma.rentalAgreement.create({
      data: {
        propertyId,
        tenantWallet: wallet.toLowerCase(),
        landlordWallet: property.ownerWallet.toLowerCase(),
        monthlyRent: String(monthlyRent),
        faithDeposit: String(faithDeposit),
        startTime: new Date(Number(startTime) * 1000),
        endTime: new Date(Number(endTime) * 1000),
        nextPaymentDue: new Date((Number(startTime) + 30 * 24 * 60 * 60) * 1000),
        durationMonths: Number(durationMonths),
        txHash,
        status: 'ACTIVE',
      },
    }),
    prisma.property.update({ where: { id: propertyId }, data: { isRented: true, isForRent: false } }),
  ]);

  return rental;
}

async function payRent(propertyId, body) {
  const { wallet, txHash, amount, wasLate, penaltyAmount, nextPaymentDue } = body;

  const rental = await prisma.rentalAgreement.findFirst({ where: { propertyId, status: 'ACTIVE' } });
  if (!rental) throw Object.assign(new Error('No active rental'), { status: 404 });
  if (rental.tenantWallet.toLowerCase() !== wallet.toLowerCase()) {
    throw Object.assign(new Error('Not the tenant'), { status: 403 });
  }

  const [payment] = await prisma.$transaction([
    prisma.rentPayment.create({
      data: {
        rentalId: rental.id,
        amount: String(amount),
        wasLate: Boolean(wasLate),
        penaltyAmount: penaltyAmount ? String(penaltyAmount) : null,
        txHash,
      },
    }),
    prisma.rentalAgreement.update({
      where: { id: rental.id },
      data: { nextPaymentDue: new Date(Number(nextPaymentDue) * 1000) },
    }),
  ]);

  return payment;
}

async function terminateRental(propertyId, body) {
  const { wallet, txHash, reason, terminatedBy } = body;

  const rental = await prisma.rentalAgreement.findFirst({ where: { propertyId, status: 'ACTIVE' } });
  if (!rental) throw Object.assign(new Error('No active rental'), { status: 404 });

  const newStatus = reason && reason.toLowerCase().includes('default') ? 'DEFAULTED' : 'ENDED';

  const [updated] = await prisma.$transaction([
    prisma.rentalAgreement.update({
      where: { id: rental.id },
      data: {
        status: newStatus,
        terminatedBy: wallet ? wallet.toLowerCase() : null,
        terminationReason: reason || null,
        txHash: txHash || null,
      },
    }),
    prisma.property.update({ where: { id: propertyId }, data: { isRented: false } }),
  ]);

  return updated;
}

async function finalizeRental(propertyId, txHash) {
  const rental = await prisma.rentalAgreement.findFirst({ where: { propertyId, status: 'ACTIVE' } });
  if (!rental) throw Object.assign(new Error('No active rental'), { status: 404 });

  const [updated] = await prisma.$transaction([
    prisma.rentalAgreement.update({
      where: { id: rental.id },
      data: { status: 'ENDED', terminationReason: 'expired', txHash: txHash || null },
    }),
    prisma.property.update({ where: { id: propertyId }, data: { isRented: false } }),
  ]);

  return updated;
}

async function getActiveRental(propertyId) {
  return prisma.rentalAgreement.findFirst({
    where: { propertyId, status: 'ACTIVE' },
    include: { payments: true },
  });
}

async function getRentalHistory(propertyId) {
  return prisma.rentalAgreement.findMany({
    where: { propertyId },
    include: { payments: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getRentalsByTenant(wallet) {
  return prisma.rentalAgreement.findMany({
    where: { tenantWallet: wallet.toLowerCase() },
    include: { property: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getRentalsByLandlord(wallet) {
  return prisma.rentalAgreement.findMany({
    where: { landlordWallet: wallet.toLowerCase() },
    include: { property: true, payments: true },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  listForRent, unlistFromRent,
  createRental, payRent, terminateRental, finalizeRental,
  getActiveRental, getRentalHistory, getRentalsByTenant, getRentalsByLandlord,
};
