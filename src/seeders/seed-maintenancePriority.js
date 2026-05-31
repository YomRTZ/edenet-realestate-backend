import sequelize from '../config/database.js';

export const seedMaintenancePriority = async () => {
  try {
    const maintenancePriority = [
      { name: 'LOW', description: 'Low priority maintenance' },
      { name: 'MEDIUM', description: 'Medium priority maintenance' },
      { name: 'HIGH', description: 'High priority maintenance' },
      { name: 'URGENT', description: 'Urgent maintenance' }
    ];

    console.log('✓ Maintenance Priority seeded');
    return maintenancePriority;
  } catch (error) {
    console.error('Error seeding maintenance priority:', error);
    throw error;
  }
};
