import sequelize from '../config/database.js';

export const seedAlertFrequency = async () => {
  try {
    const alertFrequency = [
      { name: 'IMMEDIATE', description: 'Immediate alerts' },
      { name: 'DAILY', description: 'Daily alerts' },
      { name: 'WEEKLY', description: 'Weekly alerts' }
    ];

    console.log('✓ Alert Frequency seeded');
    return alertFrequency;
  } catch (error) {
    console.error('Error seeding alert frequency:', error);
    throw error;
  }
};
