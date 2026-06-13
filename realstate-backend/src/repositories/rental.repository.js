import { getPrisma } from '../prisma/prismaClient.js';

export const rentalRepository = {
  async createRentalAgreement(data) {
    // data should contain propertyId, landlordId, tenantId, monthlyRent, depositAmount, startDate, durationMonths
    const prisma = getPrisma();
    return prisma.rentalAgreement.create({ data });
  },

  async findActiveByProperty(propertyId) {
    const prisma = getPrisma();
    return prisma.rentalAgreement.findFirst({ where: { propertyId, status: 'Active' } });
  },

  async updateRentalStatus(id, updates) {
    const prisma = getPrisma();
    return prisma.rentalAgreement.update({ where: { id }, data: updates });
  },

  async recordRentPayment(agreementId, amount, paidAt) {
    const prisma = getPrisma();
    return prisma.rentPayment.create({ data: { agreementId, amount, paidAt } });
  }
};
