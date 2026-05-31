'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('property_taxes', {
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
      tax_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      assessed_value: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      annual_tax: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      tax_paid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      tax_lien: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      last_updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('property_taxes', ['property_id']);
    await queryInterface.addIndex('property_taxes', ['tax_year']);
    await queryInterface.addIndex('property_taxes', ['tax_paid']);
    await queryInterface.addIndex('property_taxes', ['tax_lien']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('property_taxes');
  },
};
