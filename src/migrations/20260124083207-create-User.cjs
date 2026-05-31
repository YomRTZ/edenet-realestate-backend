'use strict';

module.exports= {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { 
        type: Sequelize.UUID, 
        defaultValue: Sequelize.literal('uuid_generate_v4()'), 
        primaryKey: true 
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('OWNER', 'TENANT', 'AGENT', 'ADMIN'),
        allowNull: false,
      },
      profile_image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      national_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_verified_agent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      agent_license_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      agency_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      preferred_language: {
        type: Sequelize.STRING(10),
        defaultValue: 'en',
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: { 
        type: Sequelize.DATE, 
        allowNull: false, 
        defaultValue: Sequelize.literal('NOW()') 
      },
      updatedAt: { 
        type: Sequelize.DATE, 
        allowNull: false, 
        defaultValue: Sequelize.literal('NOW()') 
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};

