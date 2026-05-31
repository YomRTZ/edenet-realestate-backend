'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION check_primary_image()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.is_primary = TRUE AND EXISTS (
          SELECT 1 FROM property_images
          WHERE property_id = NEW.property_id
            AND is_primary = TRUE
            AND id != NEW.id
        ) THEN
          RAISE EXCEPTION 'Property already has a primary image';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER enforce_primary_image
      BEFORE INSERT OR UPDATE ON property_images
      FOR EACH ROW
      EXECUTE FUNCTION check_primary_image();
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION check_rental_overlap()
      RETURNS TRIGGER AS $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM rental_agreements
          WHERE property_id = NEW.property_id
            AND is_active = true
            AND (
              (NEW.start_date BETWEEN start_date AND end_date)
              OR (NEW.end_date BETWEEN start_date AND end_date)
              OR (start_date BETWEEN NEW.start_date AND NEW.end_date)
            )
            AND id != NEW.id
        ) THEN
          RAISE EXCEPTION 'Property already has active rental agreement for these dates';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER prevent_rental_overlap
      BEFORE INSERT OR UPDATE ON rental_agreements
      FOR EACH ROW
      EXECUTE FUNCTION check_rental_overlap();
    `);

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON properties
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS enforce_primary_image ON property_images;
      DROP FUNCTION IF EXISTS check_primary_image();
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS prevent_rental_overlap ON rental_agreements;
      DROP FUNCTION IF EXISTS check_rental_overlap();
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);
  },
};
