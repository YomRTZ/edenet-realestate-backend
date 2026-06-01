import { Role } from '../models/role.model.js';
import sequelize from '../config/database.js';
import { ROLES } from '../constants/seeds.js';

export const seedRoles = async () => {
  await sequelize.authenticate();

  const roles = [
    { role_name: ROLES.ADMIN, description: 'System administrator with full access' },
    { role_name: ROLES.TENANT, description: 'Tenant user with standard access' },
    { role_name: ROLES.OWNER, description: 'Owner user with elevated business privileges' }
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