import sequelize from '../config/database.js';
import { PAYMENT_STATUS } from '../constants/seeds.js';

export const seedPaymentStatus = async () => {
  try {
    const paymentStatus = [
      { name: PAYMENT_STATUS.PENDING, description: 'Payment pending' },
      { name: PAYMENT_STATUS.PAID, description: 'Payment received' },
      { name: PAYMENT_STATUS.OVERDUE, description: 'Payment overdue' },
      { name: PAYMENT_STATUS.FAILED, description: 'Payment failed' },
      { name: PAYMENT_STATUS.REFUNDED, description: 'Payment refunded' }
    ];

    console.log('✓ Payment Status seeded');
    return paymentStatus;
  } catch (error) {
    console.error('Error seeding payment status:', error);
    throw error;
  }
};
