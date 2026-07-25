import Joi from 'joi';

export const createCourseSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().allow('', null).max(2000),
  thumbnail_public_id: Joi.string().allow('', null),
  category: Joi.string().valid('academic', 'skill', 'career', 'hobby').required(),
  grade_level: Joi.string().valid('grade_9', 'grade_10', 'grade_11', 'grade_12', 'ug', 'pg', 'open').allow(null),
  language: Joi.string().default('english'),
  price: Joi.number().min(0).default(0),
  is_free: Joi.boolean().default(false),
  validity_days: Joi.number().min(1).allow(null),
  tags: Joi.array().items(Joi.string()).default([])
});

export const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().allow('', null).max(2000),
  thumbnail_public_id: Joi.string().allow('', null),
  category: Joi.string().valid('academic', 'skill', 'career', 'hobby'),
  grade_level: Joi.string().valid('grade_9', 'grade_10', 'grade_11', 'grade_12', 'ug', 'pg', 'open').allow(null),
  language: Joi.string(),
  price: Joi.number().min(0),
  is_free: Joi.boolean(),
  validity_days: Joi.number().min(1).allow(null),
  tags: Joi.array().items(Joi.string())
});
