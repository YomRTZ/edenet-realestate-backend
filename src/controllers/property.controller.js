import * as service from '../services/property.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { removeFileByFsPath } from '../utils/fileHelper.js';

/* Create a new property */
export const createProperty = catchAsync(async (req, res) => {
  try {
    const property = await service.createProperty(req.user.id, req.body, req.file);
    res.status(201).json({ 
      success: true, 
      message: 'Property created successfully', 
      data: property 
    });
  } catch (error) {
    if (req.file) {
      await removeFileByFsPath(req.file.path);
    }
    throw error;
  }
});

/* Get all properties with pagination and filtering */
export const getProperties = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, listing_type, property_type } = req.query;
  const properties = await service.getProperties({ 
    page, 
    limit, 
    status, 
    listing_type, 
    property_type 
  });
  res.json({ 
    success: true, 
    data: properties 
  });
});

/* Get property by ID */
export const getPropertyById = catchAsync(async (req, res) => {
  const property = await service.getPropertyById(req.params.id);
  res.json({ 
    success: true, 
    data: property 
  });
});

/* Update property */
export const updateProperty = catchAsync(async (req, res) => {
  try {
    const property = await service.updateProperty(req.params.id, req.user.id, req.body, req.file);
    res.json({ 
      success: true, 
      message: 'Property updated successfully', 
      data: property 
    });
  } catch (error) {
    if (req.file) {
      await removeFileByFsPath(req.file.path);
    }
    throw error;
  }
});

/* Delete property */
export const deleteProperty = catchAsync(async (req, res) => {
  await service.deleteProperty(req.params.id, req.user.id);
  res.json({ 
    success: true, 
    message: 'Property deleted successfully' 
  });
});

/* Get user's properties */
export const getUserProperties = catchAsync(async (req, res) => {
  const properties = await service.getUserProperties(req.user.id);
  res.json({ 
    success: true, 
    data: properties 
  });
});
