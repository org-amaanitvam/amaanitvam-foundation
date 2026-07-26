import Joi from 'joi';

export const createSchema = Joi.object({
  user_id: Joi.string(),
  type: Joi.string().required(),
  title: Joi.string().required(),
  message: Joi.string().required(),
  data: Joi.object(),
  priority: Joi.string().valid('low', 'medium', 'high'),
  channel: Joi.string().valid('in_app', 'email', 'both'),
});