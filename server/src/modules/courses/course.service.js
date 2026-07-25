import * as courseRepo from './course.repository.js';
import crypto from 'crypto';

const generateSlug = (title) => {
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const uniqueSuffix = crypto.randomBytes(3).toString('hex');
  return `${baseSlug}-${uniqueSuffix}`;
};

export const getCourses = async (query = {}) => {
  return courseRepo.findAll(query);
};

export const getCourseById = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw new Error('Course not found'); // In a real app, use a custom AppError
  return course;
};

export const createCourse = async (courseData, userId) => {
  const slug = generateSlug(courseData.title);
  const newCourse = {
    ...courseData,
    slug,
    created_by_id: userId,
    is_published: false,
    is_deleted: false
  };
  return courseRepo.create(newCourse);
};

export const updateCourse = async (id, updateData) => {
  const course = await courseRepo.findById(id);
  if (!course) throw new Error('Course not found');
  
  // We explicitly do not update the slug or created_by_id to prevent inconsistencies
  delete updateData.slug;
  delete updateData.created_by_id;

  return courseRepo.update(id, updateData);
};

export const publishCourse = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw new Error('Course not found');
  
  // Add any pre-publish business rules here (e.g., must have >0 modules)
  // For Phase 1, we just flip the flag
  return courseRepo.update(id, { is_published: true });
};

export const softDeleteCourse = async (id) => {
  const course = await courseRepo.findById(id);
  if (!course) throw new Error('Course not found');
  return courseRepo.softDelete(id);
};
