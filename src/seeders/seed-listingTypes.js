import sequelize from '../config/database.js';
import { LISTING_TYPES } from '../constants/seeds.js';

export const seedListingTypes = async () => {
  try {
    const listingTypes = [
      { name: LISTING_TYPES.SALE, description: 'Property for sale' },
      { name: LISTING_TYPES.RENT, description: 'Property for rent' },
      { name: LISTING_TYPES.BOTH, description: 'Property for sale or rent' }
    ];

    console.log('✓ Listing Types seeded');
    return listingTypes;
  } catch (error) {
    console.error('Error seeding listing types:', error);
    throw error;
  }
};
