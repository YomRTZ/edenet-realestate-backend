import * as service from '../services/favorite.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const addFavorite = catchAsync(async (req, res) => {
  const favorite = await service.addFavorite(req.body.user_id, req.params.propertyId);
  res.status(201).json({
    success: true,
    message: 'Property added to favorites',
    data: favorite,
  });
});

export const getUserFavorites = catchAsync(async (req, res) => {
  const favorites = await service.getUserFavorites(req.params.userId);
  res.json({ success: true, data: favorites });
});

export const getPropertyFavorites = catchAsync(async (req, res) => {
  const favorites = await service.getPropertyFavorites(req.params.propertyId);
  res.json({ success: true, data: favorites });
});

export const removeFavorite = catchAsync(async (req, res) => {
  await service.removeFavorite(req.body.user_id, req.params.propertyId);
  res.json({ success: true, message: 'Property removed from favorites' });
});

export const isFavorited = catchAsync(async (req, res) => {
  const favorited = await service.isFavorited(req.body.user_id, req.params.propertyId);
  res.json({ success: true, data: { isFavorited: favorited } });
});
