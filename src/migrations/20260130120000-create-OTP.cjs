'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otps', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        index: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      purpose: {
        type: Sequelize.ENUM('email_verification', 'password_reset', 'two_factor'),
        allowNull: false,
        defaultValue: 'email_verification',
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      attempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('otps');
  },
};
