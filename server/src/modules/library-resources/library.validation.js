import Joi from 'joi';

// Category
const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  description: Joi.string()
    .trim()
    .allow("")
    .default(""),

  is_active: Joi.boolean()
    .default(true)
});

const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100),

  description: Joi.string()
    .trim()
    .allow(""),

  is_active: Joi.boolean()
}).min(1);

// Subject
const createSubjectSchema = Joi.object({
  category_id: Joi.string()
    .hex()
    .length(24)
    .required(),

  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  description: Joi.string()
    .trim()
    .allow("")
    .default(""),

  is_active: Joi.boolean()
    .default(true)
});

const updateSubjectSchema = Joi.object({
  category_id: Joi.string()
    .hex()
    .length(24),

  name: Joi.string()
    .trim()
    .min(3)
    .max(100),

  description: Joi.string()
    .trim()
    .allow(""),

  is_active: Joi.boolean()
}).min(1);

// Domain
const createDomainSchema = Joi.object({
  subject_id: Joi.string()
    .hex()
    .length(24)
    .required(),

  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  description: Joi.string()
    .trim()
    .allow("")
    .default(""),

  is_active: Joi.boolean()
    .default(true)
});

const updateDomainSchema = Joi.object({
  subject_id: Joi.string()
    .hex()
    .length(24),

  name: Joi.string()
    .trim()
    .min(3)
    .max(100),

  description: Joi.string()
    .trim()
    .allow(""),

  is_active: Joi.boolean()
}).min(1);

// Resource
const uploadResourceSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(150)
    .required(),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow("", null)
    .default(""),

  category_id: Joi.string()
    .hex()
    .length(24)
    .required(),

  subject_id: Joi.string()
    .hex()
    .length(24)
    .required(),

  domain_id: Joi.string()
    .hex()
    .length(24)
    .required(),

  grade_level: Joi.number()
    .integer()
    .valid(9, 10, 11, 12)
    .required(),

  resource_type: Joi.string()
    .valid("pdf", "doc", "docx", "ppt", "pptx", "video", "image", "zip")
    .required(),

  language: Joi.string()
    .trim()
    .min(2)
    .max(30)
    .default("English"),

  tags: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(2)
        .max(50)
    )
    .default([]),

  keywords: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(2)
        .max(50)
    )
    .default([]),

  is_free: Joi.boolean()
    .default(true),

  is_published: Joi.boolean()
    .default(false)
});

const updateResourceSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(150),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow("", null),

  category_id: Joi.string()
    .hex()
    .length(24),

  subject_id: Joi.string()
    .hex()
    .length(24),

  domain_id: Joi.string()
    .hex()
    .length(24),

  grade_level: Joi.number()
    .valid(9, 10, 11, 12),

  resource_type: Joi.string()
    .valid(
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "video",
      "image",
      "zip"
    ),

  language: Joi.string(),

  tags: Joi.array()
    .items(Joi.string()),

  keywords: Joi.array()
    .items(Joi.string()),

  is_free: Joi.boolean(),

  is_published: Joi.boolean()
}).min(1);

// Query Params
const resourceFilterSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  search: Joi.string()
    .trim()
    .allow(""),

  category_id: Joi.string()
    .hex()
    .length(24),

  subject_id: Joi.string()
    .hex()
    .length(24),

  domain_id: Joi.string()
    .hex()
    .length(24),

  grade_level: Joi.number()
    .valid(9, 10, 11, 12),

  resource_type: Joi.string()
    .valid("pdf", "doc", "docx", "ppt", "pptx", "image", "video", "zip"),

  language: Joi.string()
    .trim(),

  is_free: Joi.boolean(),

  is_published: Joi.boolean(),

  sort_by: Joi.string()
    .valid(
      "title",
      "createdAt",
      "updatedAt",
      "download_count",
      "view_count"
    )
    .default("createdAt"),

  sort_order: Joi.string()
    .valid("asc", "desc")
    .default("desc")
});

export { createCategorySchema, updateCategorySchema, createSubjectSchema, updateSubjectSchema, createDomainSchema, updateDomainSchema, uploadResourceSchema, updateResourceSchema, resourceFilterSchema };