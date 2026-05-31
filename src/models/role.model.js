
import  sequelize  from '../config/database.js';
import { DataTypes } from 'sequelize';
export const Role = sequelize.define('Role', {
    id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description:{
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  tableName: 'roles',
  timestamps: true,
   underscored: false
});