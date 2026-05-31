'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('saved_searches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      search_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      filters: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      alert_frequency: {
        type: Sequelize.ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY'),
        defaultValue: 'IMMEDIATE',
      },
      last_triggered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('saved_searches', ['user_id']);
    await queryInterface.addIndex('saved_searches', ['is_active']);
    await queryInterface.addIndex('saved_searches', ['alert_frequency']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('saved_searches');
  },
};
