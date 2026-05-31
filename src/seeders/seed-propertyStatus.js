import sequelize from '../config/database.js';

export const seedPropertyStatus = async () => {
  try {
    const propertyStatus = [
      { name: 'PENDING_APPROVAL', description: 'Awaiting approval' },
      { name: 'ACTIVE', description: 'Active listing' },
      { name: 'SOLD', description: 'Property sold' },
      { name: 'RENTED', description: 'Property rented' },
      { name: 'INACTIVE', description: 'Inactive listing' },
      { name: 'UNDER_CONTRACT', description: 'Under contract' }
    ];

    console.log('✓ Property Status seeded');
    return propertyStatus;
  } catch (error) {
    console.error('Error seeding property status:', error);
    throw error;
  }
};
