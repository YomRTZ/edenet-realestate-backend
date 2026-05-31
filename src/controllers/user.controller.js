import * as service from '../services/user.service.js';
import { catchAsync } from '../utils/catchAsync.js';

/* Update user profile */
export const updateUser = catchAsync(async (req, res) => {
  const user = await service.updateUser(req.user.id, req.body);
  res.json({ success: true, message: 'Profile updated successfully', data: user });
});
