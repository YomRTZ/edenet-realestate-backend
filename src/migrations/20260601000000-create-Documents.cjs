'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_documents', { force: true }).catch(() => {});
    await queryInterface.dropTable('property_documents', { force: true }).catch(() => {});

    await queryInterface.createTable('documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'properties',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      document_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      document_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      issued_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      verification_status: {
        type: Sequelize.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
        defaultValue: 'PENDING',
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('documents', ['uploaded_by']);
    await queryInterface.addIndex('documents', ['property_id']);
    await queryInterface.addIndex('documents', ['verified_by']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('documents');

    await queryInterface.createTable('user_documents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      document_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      verification_status: {
        type: Sequelize.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
        defaultValue: 'PENDING',
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      uploaded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.createTable('property_documents', {
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
      document_type: {
        type: Sequelize.ENUM('DEED', 'TITLE', 'SURVEY', 'INSPECTION', 'TAX_RECORD', 'INSURANCE', 'CONTRACT', 'LEASE'),
        allowNull: false,
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      document_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      issued_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },
};
