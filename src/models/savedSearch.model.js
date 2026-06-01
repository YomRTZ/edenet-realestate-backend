import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import { ALERT_FREQUENCY } from '../constants/seeds.js';

export const SavedSearch = sequelize.define('SavedSearch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  search_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  filters: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  alert_frequency: {
    type: DataTypes.ENUM(...Object.values(ALERT_FREQUENCY)),
    defaultValue: ALERT_FREQUENCY.IMMEDIATE,
  },
  last_triggered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'saved_searches',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true,
});
