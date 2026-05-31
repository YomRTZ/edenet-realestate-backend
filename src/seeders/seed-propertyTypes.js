import sequelize from '../config/database.js';

export const seedPropertyTypes = async () => {
  try {
    const propertyTypes = [
      { name: 'HOUSE', description: 'Single family house' },
      { name: 'APARTMENT', description: 'Multi-unit apartment building' },
      { name: 'CONDO', description: 'Condominium unit' },
      { name: 'LAND', description: 'Vacant land/plot' },
      { name: 'COMMERCIAL', description: 'Commercial property' },
      { name: 'TOWNHOUSE', description: 'Townhouse' },
      { name: 'FARM', description: 'Agricultural land/farm' }
    ];

    console.log('✓ Property Types seeded');
    return propertyTypes;
  } catch (error) {
    console.error('Error seeding property types:', error);
    throw error;
  }
};
