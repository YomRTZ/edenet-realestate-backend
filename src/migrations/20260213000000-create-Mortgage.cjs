'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mortgages', {
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
      lender_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      loan_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      remaining_balance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      interest_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      loan_start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      loan_end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_assumable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('mortgages', ['property_id']);
    await queryInterface.addIndex('mortgages', ['lender_name']);
    await queryInterface.addIndex('mortgages', ['is_assumable']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('mortgages');
  },
};
