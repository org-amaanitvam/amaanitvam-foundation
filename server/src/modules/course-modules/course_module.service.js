import * as courseModuleRepo from './course_module.repository.js';
import * as courseRepo from '../courses/course.repository.js';

export const getModulesByCourseId = async (courseId, query = {}) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Course not found');
  
  return courseModuleRepo.findAllByCourseId(courseId, query);
};

export const getModuleById = async (id, courseId) => {
  const courseModule = await courseModuleRepo.findById(id, courseId);
  if (!courseModule) throw new Error('Module not found');
  return courseModule;
};

export const createModule = async (courseId, moduleData, userId) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Course not found');

  const maxOrder = await courseModuleRepo.findMaxOrder(courseId);
  
  const newModule = {
    ...moduleData,
    course_id: courseId,
    order: maxOrder + 1,
    created_by_id: userId,
    is_deleted: false
  };
  
  return courseModuleRepo.create(newModule);
};

export const updateModule = async (id, courseId, updateData) => {
  // Prevent updating restricted fields
  delete updateData.course_id;
  delete updateData.created_by_id;
  delete updateData.order;

  const courseModule = await courseModuleRepo.update(id, updateData, courseId);
  if (!courseModule) throw new Error('Module not found');
  
  return courseModule;
};

export const softDeleteModule = async (id, courseId) => {
  const courseModule = await courseModuleRepo.softDelete(id, courseId);
  if (!courseModule) throw new Error('Module not found');
  
  return courseModule;
};

export const reorderModules = async (courseId, moduleIds) => {
  const course = await courseRepo.findById(courseId);
  if (!course) throw new Error('Course not found');

  const existingModules = await courseModuleRepo.findAllByCourseId(courseId);
  const existingIds = existingModules.map(m => m._id.toString());
  
  const payloadIdsSet = new Set(moduleIds);
  
  if (
    moduleIds.length !== existingIds.length ||
    payloadIdsSet.size !== existingIds.length ||
    !existingIds.every(id => payloadIdsSet.has(id))
  ) {
    throw new Error('All existing module IDs must be provided exactly once.');
  }

  // Update order based on the array position
  await Promise.all(
    moduleIds.map((id, index) => 
      courseModuleRepo.update(id, { order: index + 1 }, courseId)
    )
  );
  
  return true;
};

