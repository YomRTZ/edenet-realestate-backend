import sequelize from '../config/database.js';

export const seedListingTypes = async () => {
  try {
    const listingTypes = [
      { name: 'SALE', description: 'Property for sale' },
      { name: 'RENT', description: 'Property for rent' },
      { name: 'BOTH', description: 'Property for sale or rent' }
    ];

    console.log('✓ Listing Types seeded');
    return listingTypes;
  } catch (error) {
    console.error('Error seeding listing types:', error);
    throw error;
  }
};
