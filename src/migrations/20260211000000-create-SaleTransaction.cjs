'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sale_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      seller_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      buyer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      agent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      sale_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      earnest_money_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      closing_costs_seller: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      closing_costs_buyer: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      },
      contract_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      closing_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      inspection_contingency_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      financing_contingency_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deed_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      escrow_company: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      title_company: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      commission_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      transaction_status: {
        type: Sequelize.ENUM('PENDING', 'UNDER_CONTRACT', 'CLOSED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('sale_transactions', ['property_id']);
    await queryInterface.addIndex('sale_transactions', ['seller_id']);
    await queryInterface.addIndex('sale_transactions', ['buyer_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sale_transactions');
  },
};
