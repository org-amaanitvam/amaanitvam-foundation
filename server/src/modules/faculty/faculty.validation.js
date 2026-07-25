import Joi from 'joi';

export const createSchema = Joi.object({
  user_id: Joi.string().required(),
  employee_id: Joi.string().trim(),
  department: Joi.string().trim(),
  specialization: Joi.array().items(Joi.string()),
  qualification: Joi.string().trim(),
  experience_years: Joi.number().integer().min(0),
  subjects: Joi.array().items(Joi.string()),
  office_hours: Joi.string().trim(),
});

export const updateSchema = Joi.object({
  department: Joi.string().trim(),
  specialization: Joi.array().items(Joi.string()),
  qualification: Joi.string().trim(),
  experience_years: Joi.number().integer().min(0),
  subjects: Joi.array().items(Joi.string()),
  office_hours: Joi.string().trim(),
  availability: Joi.object(),
});

export const statusSchema = Joi.object({
  is_active: Joi.boolean().required(),
});

export const bulkImportSchema = Joi.object({
  facultyData: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required(),
      employee_id: Joi.string(),
      department: Joi.string(),
      specialization: Joi.array().items(Joi.string()),
      subjects: Joi.array().items(Joi.string()),
    })
  ).required(),
});