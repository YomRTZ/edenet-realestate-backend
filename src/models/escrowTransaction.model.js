import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import { ESCROW_STATUS } from '../constants/seeds.js';

export class EscrowTransaction extends Model {}

EscrowTransaction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sale_transaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    escrow_status: {
      type: DataTypes.ENUM(...Object.values(ESCROW_STATUS)),
      allowNull: false,
      defaultValue: ESCROW_STATUS.DEPOSITED,
    },
    deposited_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    released_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    released_to: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    dispute_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'EscrowTransaction',
    tableName: 'escrow_transactions',
    timestamps: false,
    underscored: true,
  }
);
