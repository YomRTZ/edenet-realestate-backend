'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('properties', ['status'], {
      name: 'idx_properties_status',
      where: { deleted_at: null },
    });

    await queryInterface.addIndex('properties', ['city', 'state'], {
      name: 'idx_properties_city_state',
    });

    await queryInterface.addIndex('properties', ['price'], {
      name: 'idx_properties_price',
      where: { status: 'ACTIVE' },
    });

    await queryInterface.addIndex('properties', ['listing_type'], {
      name: 'idx_properties_listing_type',
    });

    await queryInterface.addIndex('properties', ['owner_id'], {
      name: 'idx_properties_owner',
      where: { deleted_at: null },
    });

    await queryInterface.addIndex('properties', ['latitude', 'longitude'], {
      name: 'idx_properties_location',
    });

    await queryInterface.addIndex('properties', ['city', 'price'], {
      name: 'idx_properties_city_price',
      where: { status: 'ACTIVE' },
    });

    await queryInterface.addIndex('properties', ['property_type', 'city'], {
      name: 'idx_properties_type_city',
      where: { status: 'ACTIVE' },
    });

    await queryInterface.addIndex('properties', ['bedrooms', 'price'], {
      name: 'idx_properties_bedrooms_price',
      where: { status: 'ACTIVE' },
    });

    await queryInterface.addIndex('rental_agreements', ['start_date', 'end_date'], {
      name: 'idx_rental_agreements_dates',
      where: { is_active: true },
    });

    await queryInterface.addIndex('rental_agreements', ['tenant_id'], {
      name: 'idx_rental_agreements_tenant',
      where: { is_active: true },
    });

    await queryInterface.addIndex('rental_payments', ['payment_status', 'due_date'], {
      name: 'idx_rent_payments_status_due',
    });

    await queryInterface.addIndex('sale_transactions', ['transaction_status'], {
      name: 'idx_sale_transactions_status',
    });

    await queryInterface.addIndex('sale_transactions', ['buyer_id'], {
      name: 'idx_sale_transactions_buyer',
    });

    await queryInterface.addIndex('sale_transactions', ['seller_id'], {
      name: 'idx_sale_transactions_seller',
    });

    await queryInterface.addIndex('showings', ['scheduled_at', 'status'], {
      name: 'idx_showings_datetime',
    });

    await queryInterface.addIndex('showings', ['property_id', 'status'], {
      name: 'idx_showings_property',
    });

    await queryInterface.addIndex('property_reviews', ['rating', 'is_verified_purchase'], {
      name: 'idx_property_reviews_rating',
    });

    await queryInterface.addIndex('user_reviews', ['reviewee_id', 'rating'], {
      name: 'idx_user_reviews_reviewee',
    });

    await queryInterface.addIndex('notifications', ['user_id', 'is_read', 'created_at'], {
      name: 'idx_notifications_user_read',
    });

    await queryInterface.addIndex('saved_searches', ['filters'], {
      name: 'idx_saved_searches_filters',
      using: 'GIN',
    });

    await queryInterface.sequelize.query(
      "CREATE INDEX idx_properties_search ON properties USING GIN(to_tsvector('english', title || ' ' || description || ' ' || city || ' ' || address));"
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('properties', 'idx_properties_status');
    await queryInterface.removeIndex('properties', 'idx_properties_city_state');
    await queryInterface.removeIndex('properties', 'idx_properties_price');
    await queryInterface.removeIndex('properties', 'idx_properties_listing_type');
    await queryInterface.removeIndex('properties', 'idx_properties_owner');
    await queryInterface.removeIndex('properties', 'idx_properties_location');
    await queryInterface.removeIndex('properties', 'idx_properties_city_price');
    await queryInterface.removeIndex('properties', 'idx_properties_type_city');
    await queryInterface.removeIndex('properties', 'idx_properties_bedrooms_price');
    await queryInterface.removeIndex('rental_agreements', 'idx_rental_agreements_dates');
    await queryInterface.removeIndex('rental_agreements', 'idx_rental_agreements_tenant');
    await queryInterface.removeIndex('rental_payments', 'idx_rent_payments_status_due');
    await queryInterface.removeIndex('sale_transactions', 'idx_sale_transactions_status');
    await queryInterface.removeIndex('sale_transactions', 'idx_sale_transactions_buyer');
    await queryInterface.removeIndex('sale_transactions', 'idx_sale_transactions_seller');
    await queryInterface.removeIndex('showings', 'idx_showings_datetime');
    await queryInterface.removeIndex('showings', 'idx_showings_property');
    await queryInterface.removeIndex('property_reviews', 'idx_property_reviews_rating');
    await queryInterface.removeIndex('user_reviews', 'idx_user_reviews_reviewee');
    await queryInterface.removeIndex('notifications', 'idx_notifications_user_read');
    await queryInterface.removeIndex('saved_searches', 'idx_saved_searches_filters');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_properties_search');
  },
};
