'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('escrow_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      sale_transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sale_transactions',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      escrow_status: {
        type: Sequelize.ENUM('PENDING', 'DEPOSITED', 'RELEASED', 'DISPUTED', 'REFUNDED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      deposited_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      released_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      released_to: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      dispute_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('escrow_transactions', ['sale_transaction_id']);
    await queryInterface.addIndex('escrow_transactions', ['deposited_by']);
    await queryInterface.addIndex('escrow_transactions', ['released_to']);
    await queryInterface.addIndex('escrow_transactions', ['escrow_status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('escrow_transactions');
  },
};
