import Joi from 'joi';

export const createSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required(),
  description: Joi.string().required(),
  subject: Joi.string().trim(),
  topic: Joi.string().trim(),
  grade: Joi.string().trim(),
  course_id: Joi.string(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  tags: Joi.array().items(Joi.string()),
});

export const assignSchema = Joi.object({
  faculty_id: Joi.string().required(),
});

export const respondSchema = Joi.object({
  message: Joi.string().required(),
  attachments: Joi.array().items(Joi.string()),
  mark_as_solution: Joi.boolean(),
});

export const resolveSchema = Joi.object({
  resolution_note: Joi.string(),
});

export const rateSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  feedback: Joi.string().trim().max(500),
});
