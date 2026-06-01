import sequelize from '../config/database.js';
import { TRANSACTION_STATUS } from '../constants/seeds.js';

export const seedTransactionStatus = async () => {
  try {
    const transactionStatus = [
      { name: TRANSACTION_STATUS.NEGOTIATION, description: 'In negotiation phase' },
      { name: TRANSACTION_STATUS.CONTRACT, description: 'Contract signed' },
      { name: TRANSACTION_STATUS.SOLD, description: 'Transaction completed' },
      { name: TRANSACTION_STATUS.CANCELLED, description: 'Transaction cancelled' },
      { name: TRANSACTION_STATUS.CLOSED, description: 'Transaction closed' }
    ];

    console.log('✓ Transaction Status seeded');
    return transactionStatus;
  } catch (error) {
    console.error('Error seeding transaction status:', error);
    throw error;
  }
};
