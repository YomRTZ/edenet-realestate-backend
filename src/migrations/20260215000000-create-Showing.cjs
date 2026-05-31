'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('showings', {
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
      requester_id: {
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
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      status: {
        type: Sequelize.ENUM('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'),
        allowNull: false,
        defaultValue: 'REQUESTED',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('showings', ['property_id']);
    await queryInterface.addIndex('showings', ['requester_id']);
    await queryInterface.addIndex('showings', ['agent_id']);
    await queryInterface.addIndex('showings', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('showings');
  },
};
