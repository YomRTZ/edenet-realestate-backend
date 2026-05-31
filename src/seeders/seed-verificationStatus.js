import sequelize from '../config/database.js';

export const seedVerificationStatus = async () => {
  try {
    const verificationStatus = [
      { name: 'PENDING', description: 'Pending verification' },
      { name: 'APPROVED', description: 'Verified and approved' },
      { name: 'REJECTED', description: 'Verification rejected' },
      { name: 'FLAGGED', description: 'Flagged for review' }
    ];

    console.log('✓ Verification Status seeded');
    return verificationStatus;
  } catch (error) {
    console.error('Error seeding verification status:', error);
    throw error;
  }
};
