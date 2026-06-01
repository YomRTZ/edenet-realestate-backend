'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_reviews', { force: true }).catch(() => {});
    await queryInterface.dropTable('property_reviews', { force: true }).catch(() => {});

    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      reviewee_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
      transaction_type: {
        type: Sequelize.ENUM('SALE', 'RENTAL'),
        allowNull: true,
      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_verified_purchase: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      helpful_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Enforce that a review is EITHER of a user OR a property, not both
    await queryInterface.sequelize.query(
      `ALTER TABLE reviews ADD CONSTRAINT check_review_type_exclusive 
       CHECK ((reviewee_id IS NOT NULL AND property_id IS NULL) OR (reviewee_id IS NULL AND property_id IS NOT NULL))`
    );

    await queryInterface.addIndex('reviews', ['reviewer_id']);
    await queryInterface.addIndex('reviews', ['reviewee_id']);
    await queryInterface.addIndex('reviews', ['property_id']);
    await queryInterface.addIndex('reviews', ['rating']);
    await queryInterface.addIndex('reviews', ['is_verified_purchase']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reviews');

    await queryInterface.createTable('property_reviews', {
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
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_verified_purchase: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      helpful_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.createTable('user_reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      reviewee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      transaction_type: {
        type: Sequelize.ENUM('SALE', 'RENTAL'),
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      review_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },
};
