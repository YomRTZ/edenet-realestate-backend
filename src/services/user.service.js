import { models } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

/* Update User Profile */
export const updateUser = async (userId, data) => {
  const { 
    first_name, 
    last_name, 
    phone, 
    profile_image, 
    national_id,
    date_of_birth,
    preferred_language,
    
    two_factor_enabled
  } = data;

  try {
    const user = await models.User.findByPk(userId);
    if (!user) throw new AppError('User not found', 404);

    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (phone !== undefined) user.phone = phone;
    if (profile_image !== undefined) user.profile_image = profile_image;
    if (national_id !== undefined) user.national_id = national_id;
    if (date_of_birth !== undefined) user.date_of_birth = date_of_birth;
    if (preferred_language !== undefined) user.preferred_language = preferred_language;
    if (two_factor_enabled !== undefined) user.two_factor_enabled = two_factor_enabled;

    await user.save();
    return user;
  } catch (error) {
    console.error('[updateUser] Error:', error.message);
    throw error;
  }
};

