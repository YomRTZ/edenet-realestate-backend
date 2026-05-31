import sequelize from '../config/database.js';

export const seedEscrowStatus = async () => {
  try {
    const escrowStatus = [
      { name: 'DEPOSITED', description: 'Funds deposited in escrow' },
      { name: 'HELD', description: 'Funds held in escrow' },
      { name: 'RELEASED_TO_SELLER', description: 'Funds released to seller' },
      { name: 'REFUNDED_TO_BUYER', description: 'Funds refunded to buyer' },
      { name: 'DISPUTED', description: 'Escrow funds disputed' }
    ];

    console.log('✓ Escrow Status seeded');
    return escrowStatus;
  } catch (error) {
    console.error('Error seeding escrow status:', error);
    throw error;
  }
};
