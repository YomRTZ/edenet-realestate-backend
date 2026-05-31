import sequelize from '../config/database.js';

export const seedTransactionStatus = async () => {
  try {
    const transactionStatus = [
      { name: 'NEGOTIATION', description: 'In negotiation phase' },
      { name: 'CONTRACT', description: 'Contract signed' },
      { name: 'SOLD', description: 'Transaction completed' },
      { name: 'CANCELLED', description: 'Transaction cancelled' },
      { name: 'CLOSED', description: 'Transaction closed' }
    ];

    console.log('✓ Transaction Status seeded');
    return transactionStatus;
  } catch (error) {
    console.error('Error seeding transaction status:', error);
    throw error;
  }
};
