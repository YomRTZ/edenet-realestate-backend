import { AppError } from '../utils/AppError.js';

// Feature removed: Property Comparisons
export const featureRemoved = (req, res) => {
  res.status(410).json({ success: false, message: 'PropertyComparison feature removed' });
};

export const createPropertyComparison = featureRemoved;
export const getUserPropertyComparisons = featureRemoved;
export const getPropertyComparisonById = featureRemoved;
export const getPropertyComparisonWithDetails = featureRemoved;
export const updatePropertyComparison = featureRemoved;
export const deletePropertyComparison = featureRemoved;
export const addPropertyToComparison = featureRemoved;
export const removePropertyFromComparison = featureRemoved;
