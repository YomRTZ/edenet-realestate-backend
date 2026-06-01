import sequelize from '../config/database.js';
import { ALERT_FREQUENCY } from '../constants/seeds.js';

export const seedAlertFrequency = async () => {
  try {
    const alertFrequency = [
      { name: ALERT_FREQUENCY.IMMEDIATE, description: 'Immediate alerts' },
      { name: ALERT_FREQUENCY.DAILY, description: 'Daily alerts' },
      { name: ALERT_FREQUENCY.WEEKLY, description: 'Weekly alerts' },
      { name: ALERT_FREQUENCY.MONTHLY, description: 'Monthly alerts' }
    ];

    console.log('✓ Alert Frequency seeded');
    return alertFrequency;
  } catch (error) {
    console.error('Error seeding alert frequency:', error);
    throw error;
  }
};
