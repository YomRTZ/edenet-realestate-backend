'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rental_payments', {
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
      payer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      payment_status: {
        type: Sequelize.ENUM('PENDING', 'PAID', 'OVERDUE', 'FAILED', 'REFUNDED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      transaction_reference: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      receipt_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('rental_payments', ['rental_agreement_id']);
    await queryInterface.addIndex('rental_payments', ['payer_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rental_payments');
  },
};
