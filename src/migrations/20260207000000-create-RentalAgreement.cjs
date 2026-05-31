'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rental_agreements', {
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
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      tenant_id: {
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
      monthly_rent: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      security_deposit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      late_fee_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      late_fee_fixed: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      grace_period_days: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      renewal_option: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      termination_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      utilities_included: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      signed_by_owner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      signed_by_tenant: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      agreement_file_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('rental_agreements', ['property_id']);
    await queryInterface.addIndex('rental_agreements', ['owner_id']);
    await queryInterface.addIndex('rental_agreements', ['tenant_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rental_agreements');
  },
};
