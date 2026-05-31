'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
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

    await queryInterface.addIndex('property_documents', ['property_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('property_documents');
  },
};
