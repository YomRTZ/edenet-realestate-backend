import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';

export const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  property_type: {
    type: DataTypes.ENUM('HOUSE', 'APARTMENT', 'CONDO', 'LAND', 'COMMERCIAL', 'TOWNHOUSE', 'FARM'),
    allowNull: false,
  },
  listing_type: {
    type: DataTypes.ENUM('SALE', 'RENT', 'BOTH'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING_APPROVAL', 'ACTIVE', 'SOLD', 'RENTED', 'INACTIVE', 'UNDER_CONTRACT'),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  bathrooms: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
  },
  area_size: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  lot_size: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  year_built: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parking_spots: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  property_tax: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  hoa_fees: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  zip_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  virtual_tour_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  youtube_video_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  energy_rating: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G'),
    allowNull: true,
  },
  pet_policy: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_furnished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'properties',
  timestamps: true,
  paranoid: true,
});
