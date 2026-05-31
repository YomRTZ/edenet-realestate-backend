import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/* Upload image for property */
export const uploadPropertyImage = async (propertyId, userId, data) => {
  try {
    // Verify property exists and user owns it
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only add images to your own properties', 403);
    if (property.deleted_at) throw new AppError('Cannot add images to a deleted property', 400);

    const { image_url, caption, is_primary, sort_order } = data;

    // If marking as primary, remove primary from other images
    if (is_primary) {
      await models.PropertyImage.update(
        { is_primary: false },
        { where: { property_id: propertyId } }
      );
    }

    const image = await models.PropertyImage.create({
      property_id: propertyId,
      image_url,
      caption,
      is_primary: is_primary || false,
      sort_order: sort_order || 0,
    });

    return image;
  } catch (error) {
    console.error('[uploadPropertyImage] Error:', error.message);
    throw error;
  }
};

/* Get all images for a property */
export const getPropertyImages = async (propertyId) => {
  try {
    // Verify property exists
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);

    const images = await models.PropertyImage.findAll({
      where: { property_id: propertyId },
      order: [['is_primary', 'DESC'], ['sort_order', 'ASC']],
    });

    return images;
  } catch (error) {
    console.error('[getPropertyImages] Error:', error.message);
    throw error;
  }
};

/* Get image by ID */
export const getImageById = async (imageId) => {
  try {
    const image = await models.PropertyImage.findByPk(imageId);
    if (!image) throw new AppError('Image not found', 404);

    return image;
  } catch (error) {
    console.error('[getImageById] Error:', error.message);
    throw error;
  }
};

/* Update image */
export const updatePropertyImage = async (imageId, userId, data) => {
  try {
    const image = await models.PropertyImage.findByPk(imageId);
    if (!image) throw new AppError('Image not found', 404);

    // Verify user owns the property
    const property = await models.Property.findByPk(image.property_id);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only update images for your own properties', 403);

    const { caption, sort_order, is_primary } = data;

    // If marking as primary, remove primary from other images
    if (is_primary === true && !image.is_primary) {
      await models.PropertyImage.update(
        { is_primary: false },
        { where: { property_id: image.property_id } }
      );
    }

    if (caption !== undefined) image.caption = caption;
    if (sort_order !== undefined) image.sort_order = sort_order;
    if (is_primary !== undefined) image.is_primary = is_primary;

    await image.save();
    return image;
  } catch (error) {
    console.error('[updatePropertyImage] Error:', error.message);
    throw error;
  }
};

/* Delete image */
export const deletePropertyImage = async (imageId, userId) => {
  try {
    const image = await models.PropertyImage.findByPk(imageId);
    if (!image) throw new AppError('Image not found', 404);

    // Verify user owns the property
    const property = await models.Property.findByPk(image.property_id);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only delete images from your own properties', 403);

    await image.destroy();
  } catch (error) {
    console.error('[deletePropertyImage] Error:', error.message);
    throw error;
  }
};

/* Set primary image for property */
export const setPrimaryImage = async (propertyId, imageId, userId) => {
  try {
    // Verify property exists
    const property = await models.Property.findByPk(propertyId);
    if (!property) throw new AppError('Property not found', 404);
    if (property.owner_id !== userId) throw new AppError('Unauthorized: You can only set primary images for your own properties', 403);

    // Verify image exists and belongs to property
    const image = await models.PropertyImage.findByPk(imageId);
    if (!image) throw new AppError('Image not found', 404);
    if (image.property_id !== propertyId) throw new AppError('Image does not belong to this property', 400);

    // Remove primary from all images for this property
    await models.PropertyImage.update(
      { is_primary: false },
      { where: { property_id: propertyId } }
    );

    // Set as primary
    await image.update({ is_primary: true });
    return image;
  } catch (error) {
    console.error('[setPrimaryImage] Error:', error.message);
    throw error;
  }
};
