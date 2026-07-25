import Joi from 'joi';

export const createCourseModuleSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null)
});

export const updateCourseModuleSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow('', null)
});

export const reorderModulesSchema = Joi.object({
  moduleIds: Joi.array().items(Joi.string().trim()).required()
});
