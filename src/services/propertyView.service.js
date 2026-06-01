// PropertyView service removed — feature deprecated.
import { AppError } from '../utils/AppError.js';

const removed = async () => {
  throw new AppError('PropertyView feature removed', 410);
};

export const createPropertyView = removed;
export const getPropertyViews = removed;
export const getUserViews = removed;
