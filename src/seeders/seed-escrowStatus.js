import sequelize from '../config/database.js';
import { ESCROW_STATUS } from '../constants/seeds.js';

export const seedEscrowStatus = async () => {
  try {
    const escrowStatus = [
      { name: ESCROW_STATUS.DEPOSITED, description: 'Funds deposited in escrow' },
      { name: ESCROW_STATUS.HELD, description: 'Funds held in escrow' },
      { name: ESCROW_STATUS.RELEASED_TO_SELLER, description: 'Funds released to seller' },
      { name: ESCROW_STATUS.REFUNDED_TO_BUYER, description: 'Funds refunded to buyer' },
      { name: ESCROW_STATUS.DISPUTED, description: 'Escrow funds disputed' }
    ];

    console.log('✓ Escrow Status seeded');
    return escrowStatus;
  } catch (error) {
    console.error('Error seeding escrow status:', error);
    throw error;
  }
};
