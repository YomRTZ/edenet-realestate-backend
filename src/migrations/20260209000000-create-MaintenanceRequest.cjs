'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenance_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      rental_agreement_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'rental_agreements',
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
      issue_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
        allowNull: false,
        defaultValue: 'MEDIUM',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      photos_url: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'COMPLETED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      assigned_to: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      estimated_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      actual_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('maintenance_requests', ['rental_agreement_id']);
    await queryInterface.addIndex('maintenance_requests', ['tenant_id']);
    await queryInterface.addIndex('maintenance_requests', ['property_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('maintenance_requests');
  },
};
