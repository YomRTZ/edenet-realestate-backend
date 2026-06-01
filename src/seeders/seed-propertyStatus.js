import sequelize from '../config/database.js';
import { PROPERTY_STATUS } from '../constants/seeds.js';

export const seedPropertyStatus = async () => {
  try {
    const propertyStatus = [
      { name: PROPERTY_STATUS.PENDING_APPROVAL, description: 'Awaiting approval' },
      { name: PROPERTY_STATUS.ACTIVE, description: 'Active listing' },
      { name: PROPERTY_STATUS.SOLD, description: 'Property sold' },
      { name: PROPERTY_STATUS.RENTED, description: 'Property rented' },
      { name: PROPERTY_STATUS.INACTIVE, description: 'Inactive listing' },
      { name: PROPERTY_STATUS.UNDER_CONTRACT, description: 'Under contract' }
    ];

    console.log('✓ Property Status seeded');
    return propertyStatus;
  } catch (error) {
    console.error('Error seeding property status:', error);
    throw error;
  }
};
