import sequelize from '../config/database.js';
import { VERIFICATION_STATUS } from '../constants/seeds.js';

export const seedVerificationStatus = async () => {
  try {
    const verificationStatus = [
      { name: VERIFICATION_STATUS.PENDING, description: 'Pending verification' },
      { name: VERIFICATION_STATUS.APPROVED, description: 'Verified and approved' },
      { name: VERIFICATION_STATUS.REJECTED, description: 'Verification rejected' },
      { name: VERIFICATION_STATUS.FLAGGED, description: 'Flagged for review' }
    ];

    console.log('✓ Verification Status seeded');
    return verificationStatus;
  } catch (error) {
    console.error('Error seeding verification status:', error);
    throw error;
  }
};
