import sequelize from '../config/database.js';
import { NOTIFICATION_TYPES } from '../constants/seeds.js';

export const seedNotificationTypes = async () => {
  try {
    const notificationTypes = [
      { name: NOTIFICATION_TYPES.INQUIRY, description: 'Property inquiry notification' },
      { name: NOTIFICATION_TYPES.PAYMENT, description: 'Payment notification' },
      { name: NOTIFICATION_TYPES.VERIFICATION, description: 'Verification update' },
      { name: NOTIFICATION_TYPES.CONTRACT, description: 'Contract notification' },
      { name: NOTIFICATION_TYPES.REMINDER, description: 'Reminder notification' },
      { name: NOTIFICATION_TYPES.SHOWING, description: 'Property showing notification' },
      { name: NOTIFICATION_TYPES.MAINTENANCE, description: 'Maintenance notification' }
    ];

    console.log('✓ Notification Types seeded');
    return notificationTypes;
  } catch (error) {
    console.error('Error seeding notification types:', error);
    throw error;
  }
};
