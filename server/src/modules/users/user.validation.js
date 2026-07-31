import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().max(20),
  bio: Joi.string().trim().max(500),
  profile_image: Joi.string().uri(),
});