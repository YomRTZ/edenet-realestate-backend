import sequelize from '../config/database.js';

export const seedShowingStatus = async () => {
  try {
    const showingStatus = [
      { name: 'PENDING', description: 'Showing pending' },
      { name: 'CONFIRMED', description: 'Showing confirmed' },
      { name: 'COMPLETED', description: 'Showing completed' },
      { name: 'CANCELLED', description: 'Showing cancelled' },
      { name: 'NO_SHOW', description: 'No show' },
      { name: 'RESCHEDULED', description: 'Showing rescheduled' }
    ];

    console.log('✓ Showing Status seeded');
    return showingStatus;
  } catch (error) {
    console.error('Error seeding showing status:', error);
    throw error;
  }
};
