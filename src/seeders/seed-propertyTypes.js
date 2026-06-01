import sequelize from '../config/database.js';
import { PROPERTY_TYPES } from '../constants/seeds.js';

export const seedPropertyTypes = async () => {
  try {
    const propertyTypes = [
      { name: PROPERTY_TYPES.HOUSE, description: 'Single family house' },
      { name: PROPERTY_TYPES.APARTMENT, description: 'Multi-unit apartment building' },
      { name: PROPERTY_TYPES.CONDO, description: 'Condominium unit' },
      { name: PROPERTY_TYPES.LAND, description: 'Vacant land/plot' },
      { name: PROPERTY_TYPES.COMMERCIAL, description: 'Commercial property' },
      { name: PROPERTY_TYPES.TOWNHOUSE, description: 'Townhouse' },
      { name: PROPERTY_TYPES.FARM, description: 'Agricultural land/farm' }
    ];

    console.log('✓ Property Types seeded');
    return propertyTypes;
  } catch (error) {
    console.error('Error seeding property types:', error);
    throw error;
  }
};
