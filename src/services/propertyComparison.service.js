// PropertyComparison service removed — feature deprecated.
import { AppError } from '../utils/AppError.js';

const removed = async () => {
  throw new AppError('PropertyComparison feature removed', 410);
};

export const createPropertyComparison = removed;
export const getUserPropertyComparisons = removed;
export const getPropertyComparisonById = removed;
export const getPropertyComparisonWithDetails = removed;
export const updatePropertyComparison = removed;
export const deletePropertyComparison = removed;
export const addPropertyToComparison = removed;
export const removePropertyFromComparison = removed;
