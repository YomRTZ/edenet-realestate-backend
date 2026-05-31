import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/* Update User Profile */
export const updateUser = async (userId, data) => {
  const { full_name, city, country, gender } = data;

  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    if (full_name !== undefined) user.full_name = full_name;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (gender !== undefined) user.gender = gender;

    await user.save();
    return user;
  } catch (error) {
    console.error('[updateUser] Error:', error.message);
    throw error;
  }
};

