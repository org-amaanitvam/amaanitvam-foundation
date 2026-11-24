import * as assignmentRepo from './assignment.repository.js';
import * as courseRepo from '../courses/course.repository.js';
import * as courseModuleRepo from '../course-modules/course_module.repository.js';
import * as lessonRepo from '../lessons/lesson.repository.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';

const verifyRelationalIntegrity = async (courseId, moduleId, lessonId) => {
  if (moduleId) {
    const mod = await courseModuleRepo.findById(moduleId);
    if (!mod) {
      throw new NotFoundError('Course module not found');
    }
    if (String(mod.course_id) !== String(courseId)) {
      throw new BadRequestError('Module does not belong to the specified course');
    }
  }

  if (lessonId) {
    const lesson = await lessonRepo.findById(lessonId);
    if (!lesson) {
      throw new NotFoundError('Lesson not found');
    }
    if (String(lesson.course_id) !== String(courseId)) {
      throw new BadRequestError('Lesson does not belong to the specified course');
    }
    if (moduleId && String(lesson.module_id) !== String(moduleId)) {
      throw new BadRequestError('Lesson does not belong to the specified module');
    }
  }
};

export const getAssignmentsByCourse = async (courseId, query = {}) => {
  const course = await courseRepo.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }
  return assignmentRepo.findAllByCourseId(courseId, query);
};

export const getAssignmentById = async (assignmentId) => {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }
  return assignment;
};

export const createAssignment = async (courseId, assignmentData, createdById) => {
  const course = await courseRepo.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  await verifyRelationalIntegrity(courseId, assignmentData.module_id, assignmentData.lesson_id);

  const newAssignmentData = {
    module_id: assignmentData.module_id,
    lesson_id: assignmentData.lesson_id,
    title: assignmentData.title,
    description: assignmentData.description,
    instructions: assignmentData.instructions,
    due_date: assignmentData.due_date,
    max_score: assignmentData.max_score,
    attachment_public_ids: assignmentData.attachment_public_ids,
    is_published: assignmentData.is_published,
    course_id: courseId,
    created_by_id: createdById,
    is_deleted: false
  };

  return assignmentRepo.create(newAssignmentData);
};

export const updateAssignment = async (assignmentId, assignmentData) => {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  const courseId = String(assignment.course_id);

  // If updating relations, verify they exist and belong to the same course
  if (assignmentData.module_id !== undefined || assignmentData.lesson_id !== undefined) {
    const moduleId = assignmentData.module_id !== undefined ? assignmentData.module_id : assignment.module_id;
    const lessonId = assignmentData.lesson_id !== undefined ? assignmentData.lesson_id : assignment.lesson_id;
    await verifyRelationalIntegrity(courseId, moduleId, lessonId);
  }

  const updateData = {};
  const editableFields = [
    'module_id',
    'lesson_id',
    'title',
    'description',
    'instructions',
    'due_date',
    'max_score',
    'attachment_public_ids',
    'is_published'
  ];

  for (const field of editableFields) {
    if (assignmentData[field] !== undefined) {
      updateData[field] = assignmentData[field];
    }
  }

  return assignmentRepo.update(assignmentId, updateData);
};

export const deleteAssignment = async (assignmentId) => {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }
  return assignmentRepo.softDelete(assignmentId);
};

export const getAssignmentForStudent = async (assignmentId) => {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment || !assignment.is_published) {
    throw new NotFoundError('Assignment not found');
  }
  return assignment;
};
