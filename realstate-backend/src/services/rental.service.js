import { rentalRepository } from '../repositories/rental.repository.js';

export const rentalService = {
  async createRentalFromEvent(eventData) {
    // eventData should include propertyId, landlordAddress, tenantAddress, monthlyRent, durationMonths, startTimestamp
    const payload = {
      propertyId: eventData.propertyId,
      landlordId: eventData.landlordAddress,
      tenantId: eventData.tenantAddress,
      monthlyRent: eventData.monthlyRent,
      depositAmount: eventData.depositAmount || eventData.monthlyRent,
      startDate: eventData.startTimestamp ? new Date(eventData.startTimestamp * 1000) : null,
      durationMonths: eventData.durationMonths,
      status: 'Active'
    };

    try {
      const created = await rentalRepository.createRentalAgreement(payload);
      console.log('rentalService: created rental agreement', created.id);
      return created;
    } catch (err) {
      console.error('rentalService.createRentalFromEvent error', err && err.message);
      throw err;
    }
  },

  async recordPayment(agreementId, amount) {
    try {
      const payment = await rentalRepository.recordRentPayment(agreementId, amount, new Date());
      console.log('rentalService: recorded payment', payment.id);
      return payment;
    } catch (err) {
      console.error('rentalService.recordPayment error', err && err.message);
      throw err;
    }
  },

  async terminateAgreement(agreementId, reason) {
    try {
      const updated = await rentalRepository.updateRentalStatus(agreementId, { status: 'Terminated' });
      console.log('rentalService: terminated agreement', agreementId, reason);
      return updated;
    } catch (err) {
      console.error('rentalService.terminateAgreement error', err && err.message);
      throw err;
    }
  }
};
