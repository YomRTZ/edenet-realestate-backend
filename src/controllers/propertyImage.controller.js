import * as service from '../services/propertyImage.service.js';
import { catchAsync } from '../utils/catchAsync.js';

/* Upload image for property */
export const uploadPropertyImage = catchAsync(async (req, res) => {
  const image = await service.uploadPropertyImage(req.params.propertyId, req.user.id, req.body);
  res.status(201).json({ 
    success: true, 
    message: 'Image uploaded successfully', 
    data: image 
  });
});

/* Get all images for a property */
export const getPropertyImages = catchAsync(async (req, res) => {
  const images = await service.getPropertyImages(req.params.propertyId);
  res.json({ 
    success: true, 
    data: images 
  });
});

/* Get image by ID */
export const getImageById = catchAsync(async (req, res) => {
  const image = await service.getImageById(req.params.imageId);
  res.json({ 
    success: true, 
    data: image 
  });
});

/* Update image (caption, sort order, primary status) */
export const updatePropertyImage = catchAsync(async (req, res) => {
  const image = await service.updatePropertyImage(req.params.imageId, req.user.id, req.body);
  res.json({ 
    success: true, 
    message: 'Image updated successfully', 
    data: image 
  });
});

/* Delete image */
export const deletePropertyImage = catchAsync(async (req, res) => {
  await service.deletePropertyImage(req.params.imageId, req.user.id);
  res.json({ 
    success: true, 
    message: 'Image deleted successfully' 
  });
});

/* Set primary image for property */
export const setPrimaryImage = catchAsync(async (req, res) => {
  const image = await service.setPrimaryImage(req.params.propertyId, req.params.imageId, req.user.id);
  res.json({ 
    success: true, 
    message: 'Primary image set successfully', 
    data: image 
  });
});
