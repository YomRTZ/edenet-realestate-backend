import sequelize from '../config/database.js';

export const seedPaymentStatus = async () => {
  try {
    const paymentStatus = [
      { name: 'PENDING', description: 'Payment pending' },
      { name: 'PAID', description: 'Payment received' },
      { name: 'OVERDUE', description: 'Payment overdue' },
      { name: 'FAILED', description: 'Payment failed' },
      { name: 'REFUNDED', description: 'Payment refunded' }
    ];

    console.log('✓ Payment Status seeded');
    return paymentStatus;
  } catch (error) {
    console.error('Error seeding payment status:', error);
    throw error;
  }
};
