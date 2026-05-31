import { Role } from '../models/role.model.js';
import sequelize from '../config/database.js';

export const seedRoles = async () => {
  await sequelize.authenticate();

  const roles = [
    { role_name: 'admin', description: 'System administrator with full access' },
    { role_name: 'tenant', description: 'Tenant user with standard access' },
    { role_name: 'agent', description: 'Agent user for sales or support operations' },
    { role_name: 'owner', description: 'Owner user with elevated business privileges' }
  ];

  for (const roleData of roles) {
    const [role, created] = await Role.findOrCreate({
      where: { role_name: roleData.role_name },
      defaults: roleData
    });

    if (created) {
      console.log(`Role created: ${roleData.role_name}`);
    } else {
      console.log(`Role already exists: ${roleData.role_name}`);
    }
  }
};