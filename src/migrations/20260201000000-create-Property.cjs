'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('properties', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      property_type: {
        type: Sequelize.ENUM('HOUSE', 'APARTMENT', 'CONDO', 'LAND', 'COMMERCIAL', 'TOWNHOUSE', 'FARM'),
        allowNull: false,
      },
      listing_type: {
        type: Sequelize.ENUM('SALE', 'RENT', 'BOTH'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('PENDING_APPROVAL', 'ACTIVE', 'SOLD', 'RENTED', 'INACTIVE', 'UNDER_CONTRACT'),
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bathrooms: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: true,
      },
      area_size: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      lot_size: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      year_built: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      parking_spots: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      property_tax: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      hoa_fees: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      zip_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      virtual_tour_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      youtube_video_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      energy_rating: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G'),
        allowNull: true,
      },
      pet_policy: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_furnished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable('properties');
  },
};
