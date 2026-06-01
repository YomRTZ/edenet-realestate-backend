import sequelize from '../config/database.js';
import { MAINTENANCE_STATUS } from '../constants/seeds.js';

export const seedMaintenanceStatus = async () => {
  try {
    const maintenanceStatus = [
      { name: MAINTENANCE_STATUS.SUBMITTED, description: 'Maintenance request submitted' },
      { name: MAINTENANCE_STATUS.ASSIGNED, description: 'Maintenance assigned' },
      { name: MAINTENANCE_STATUS.IN_PROGRESS, description: 'Maintenance in progress' },
      { name: MAINTENANCE_STATUS.COMPLETED, description: 'Maintenance completed' },
      { name: MAINTENANCE_STATUS.REJECTED, description: 'Maintenance request rejected' },
      { name: MAINTENANCE_STATUS.ON_HOLD, description: 'Maintenance on hold' }
    ];

    console.log('✓ Maintenance Status seeded');
    return maintenanceStatus;
  } catch (error) {
    console.error('Error seeding maintenance status:', error);
    throw error;
  }
};
