import sequelize from '../config/database.js';

export const seedMaintenanceStatus = async () => {
  try {
    const maintenanceStatus = [
      { name: 'SUBMITTED', description: 'Maintenance request submitted' },
      { name: 'ASSIGNED', description: 'Maintenance assigned' },
      { name: 'IN_PROGRESS', description: 'Maintenance in progress' },
      { name: 'COMPLETED', description: 'Maintenance completed' },
      { name: 'REJECTED', description: 'Maintenance request rejected' },
      { name: 'ON_HOLD', description: 'Maintenance on hold' }
    ];

    console.log('✓ Maintenance Status seeded');
    return maintenanceStatus;
  } catch (error) {
    console.error('Error seeding maintenance status:', error);
    throw error;
  }
};
