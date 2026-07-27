import * as lessonRepo from './lesson.repository.js';
import * as courseModuleRepo from '../course-modules/course_module.repository.js';
import cloudinary from '../../config/cloudinary.js';

export const getLessonsByModuleId = async (courseId, moduleId, query = {}) => {
  const courseModule = await courseModuleRepo.findById(moduleId, courseId);
  if (!courseModule) throw new Error('Module not found');
  
  return lessonRepo.findAllByModuleId(moduleId, query);
};

export const getLessonById = async (id, moduleId = null) => {
  const lesson = await lessonRepo.findById(id, moduleId);
  if (!lesson) throw new Error('Lesson not found');
  return lesson;
};

export const createLesson = async (courseId, moduleId, lessonData) => {
  const courseModule = await courseModuleRepo.findById(moduleId, courseId);
  if (!courseModule) throw new Error('Module not found');

  let order = lessonData.order;
  if (order === undefined || order === null) {
    const maxOrder = await lessonRepo.findMaxOrder(moduleId);
    order = maxOrder + 1;
  }
  
  const newLesson = {
    ...lessonData,
    course_id: courseModule.course_id,
    module_id: moduleId,
    order,
    is_deleted: false
  };
  
  return lessonRepo.create(newLesson);
};

export const updateLesson = async (id, updateData, moduleId = null) => {
  delete updateData.course_id;
  delete updateData.module_id;

  const lesson = await lessonRepo.update(id, updateData, moduleId);
  if (!lesson) throw new Error('Lesson not found');
  
  return lesson;
};

export const softDeleteLesson = async (id, moduleId = null) => {
  const lesson = await lessonRepo.softDelete(id, moduleId);
  if (!lesson) throw new Error('Lesson not found');
  
  return lesson;
};

export const getLessonContent = async (id, user = null) => {
  const lesson = await lessonRepo.findById(id);
  if (!lesson) throw new Error('Lesson not found');

  // Preview Access & Enrollment Verification (Approved Decisions 2 & 3)
  // Note: Authentication is enforced at the route middleware layer.
  if (!lesson.is_preview) {
    // Phase 3 Integration Point: Defer enrollment verification until Phase 5 Enrollments module is available.
    // During Phase 3 development, authenticated users proceed without enrollment verification.
  }

  // Content Endpoint Behaviour (Approved Decision 4)
  if (lesson.lesson_type === 'text') {
    return {
      lesson_type: 'text',
      content_text: lesson.content_text
    };
   }

  if (lesson.lesson_type === 'video' || lesson.lesson_type === 'pdf') {
    if (!lesson.content_public_id) {
      throw new Error('Media content identifier is missing');
    }

    const resourceType = lesson.lesson_type === 'video' ? 'video' : 'image';
    const signedUrl = cloudinary.url(lesson.content_public_id, {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 900,
      resource_type: resourceType
    });

    return {
      lesson_type: lesson.lesson_type,
      content_url: signedUrl
    };
  }

  throw new Error('Unsupported lesson type');
};
