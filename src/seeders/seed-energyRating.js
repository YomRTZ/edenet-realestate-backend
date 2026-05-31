import sequelize from '../config/database.js';

export const seedEnergyRating = async () => {
  try {
    const energyRating = [
      { name: 'A', description: 'Excellent energy efficiency' },
      { name: 'B', description: 'Very good energy efficiency' },
      { name: 'C', description: 'Good energy efficiency' },
      { name: 'D', description: 'Average energy efficiency' },
      { name: 'E', description: 'Poor energy efficiency' },
      { name: 'F', description: 'Very poor energy efficiency' },
      { name: 'G', description: 'Extremely poor energy efficiency' }
    ];

    console.log('✓ Energy Rating seeded');
    return energyRating;
  } catch (error) {
    console.error('Error seeding energy rating:', error);
    throw error;
  }
};
