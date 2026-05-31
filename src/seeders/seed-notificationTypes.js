import sequelize from '../config/database.js';

export const seedNotificationTypes = async () => {
  try {
    const notificationTypes = [
      { name: 'INQUIRY', description: 'Property inquiry notification' },
      { name: 'PAYMENT', description: 'Payment notification' },
      { name: 'VERIFICATION', description: 'Verification update' },
      { name: 'CONTRACT', description: 'Contract notification' },
      { name: 'REMINDER', description: 'Reminder notification' },
      { name: 'SHOWING', description: 'Property showing notification' },
      { name: 'MAINTENANCE', description: 'Maintenance notification' }
    ];

    console.log('✓ Notification Types seeded');
    return notificationTypes;
  } catch (error) {
    console.error('Error seeding notification types:', error);
    throw error;
  }
};
