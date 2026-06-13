// src/validation/propertySchemas.js
const { z } = require('zod');

// Reusable coerced number — accepts string "3" or number 3
const positiveInt = (label) =>
  z.coerce.number({ invalid_type_error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(0, `${label} must be 0 or greater`);

const confirmRequestSchema = z.object({
  tempId:  z.string().uuid('tempId must be a valid UUID'),
  txHash:  z.string().regex(/^0x[0-9a-fA-F]{64}$/, 'txHash must be a valid 32-byte hex transaction hash'),
});

const listPropertiesQuerySchema = z.object({
  location:     z.string().trim().optional(),
  propertyType: z.string().trim().optional(),
  bedrooms:     z.coerce.number().int().min(0).optional(),
  minPrice:     z.coerce.number().min(0).optional(),
  maxPrice:     z.coerce.number().min(0).optional(),
}).optional().default({});

// prepare and update-request both use multipart/form-data —
// body fields arrive as strings so we coerce everything.
const propertyDetailsSchema = z.object({
  wallet:       z.string().regex(/^0x[0-9a-fA-F]{40}$/, 'Invalid wallet address'),
  name:         z.string().trim().min(2, 'Name must be at least 2 characters'),
  location:     z.string().trim().min(2, 'Location is required'),
  propertyType: z.string().trim().min(1, 'Property type is required'),
  price:        z.coerce.number().positive('Price must be greater than 0'),
  bedrooms:     positiveInt('Bedrooms').optional(),
  bathrooms:    positiveInt('Bathrooms').optional(),
  sqft:         positiveInt('Square feet').optional(),
  parking:      positiveInt('Parking').optional(),
  floors:       positiveInt('Floors').optional(),
  yearBuilt:    z.coerce.number().int().min(1800).max(new Date().getFullYear(), 'Year built cannot be in the future').optional(),
  description:  z.string().trim().max(2000, 'Description cannot exceed 2000 characters').optional(),
});

module.exports = {
  confirmRequestSchema,
  listPropertiesQuerySchema,
  propertyDetailsSchema,
};
