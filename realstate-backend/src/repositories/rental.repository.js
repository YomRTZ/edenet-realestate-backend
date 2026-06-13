import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const rentalRepository = {
  async createRentalAgreement(data) {
    // data should contain propertyId, landlordId, tenantId, monthlyRent, depositAmount, startDate, durationMonths
    return prisma.rentalAgreement.create({ data });
  },

  async findActiveByProperty(propertyId) {
    return prisma.rentalAgreement.findFirst({ where: { propertyId, status: 'Active' } });
  },

  async updateRentalStatus(id, updates) {
    return prisma.rentalAgreement.update({ where: { id }, data: updates });
  },

  async recordRentPayment(agreementId, amount, paidAt) {
    return prisma.rentPayment.create({ data: { agreementId, amount, paidAt } });
  }
};
