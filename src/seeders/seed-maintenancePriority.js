import sequelize from '../config/database.js';
import { MAINTENANCE_PRIORITY } from '../constants/seeds.js';

export const seedMaintenancePriority = async () => {
  try {
    const maintenancePriority = [
      { name: MAINTENANCE_PRIORITY.LOW, description: 'Low priority maintenance' },
      { name: MAINTENANCE_PRIORITY.MEDIUM, description: 'Medium priority maintenance' },
      { name: MAINTENANCE_PRIORITY.HIGH, description: 'High priority maintenance' },
      { name: MAINTENANCE_PRIORITY.URGENT, description: 'Urgent maintenance' }
    ];

    console.log('✓ Maintenance Priority seeded');
    return maintenancePriority;
  } catch (error) {
    console.error('Error seeding maintenance priority:', error);
    throw error;
  }
};
