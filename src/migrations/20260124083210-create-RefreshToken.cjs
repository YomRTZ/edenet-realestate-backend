'use strict';

module.exports= {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
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
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      device: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      ip: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    //Indexes
    await queryInterface.addIndex('refresh_tokens', ['token']);
    await queryInterface.addIndex('refresh_tokens', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },
};