import sequelize from '../config/database.js';
import { SHOWING_STATUS } from '../constants/seeds.js';

export const seedShowingStatus = async () => {
  try {
    const showingStatus = [
      { name: SHOWING_STATUS.PENDING, description: 'Showing pending' },
      { name: SHOWING_STATUS.CONFIRMED, description: 'Showing confirmed' },
      { name: SHOWING_STATUS.COMPLETED, description: 'Showing completed' },
      { name: SHOWING_STATUS.CANCELLED, description: 'Showing cancelled' },
      { name: SHOWING_STATUS.NO_SHOW, description: 'No show' },
      { name: SHOWING_STATUS.RESCHEDULED, description: 'Showing rescheduled' }
    ];

    console.log('✓ Showing Status seeded');
    return showingStatus;
  } catch (error) {
    console.error('Error seeding showing status:', error);
    throw error;
  }
};
