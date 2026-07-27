import Joi from 'joi';

export const createLessonSchema = Joi.object({
  title: Joi.string().required(),
  lesson_type: Joi.string().valid('video', 'text', 'pdf'),
  content_public_id: Joi.string().allow('', null),
  content_text: Joi.string().allow('', null),
  duration_min: Joi.number().allow(null),
  order: Joi.number(),
  is_preview: Joi.boolean().default(false),
  is_published: Joi.boolean().default(false)
});

export const updateLessonSchema = Joi.object({
  title: Joi.string(),
  lesson_type: Joi.string().valid('video', 'text', 'pdf'),
  content_public_id: Joi.string().allow('', null),
  content_text: Joi.string().allow('', null),
  duration_min: Joi.number().allow(null),
  order: Joi.number(),
  is_preview: Joi.boolean(),
  is_published: Joi.boolean()
});
