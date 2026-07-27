import * as lessonService from './lesson.service.js';
import { createLessonSchema, updateLessonSchema } from './lesson.validation.js';

const handleValidationError = (res, error) => {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input provided.',
      details: error.details.map(d => d.message)
    }
  });
};

export const getLessonsByModuleId = async (req, res, next) => {
  try {
    const lessons = await lessonService.getLessonsByModuleId(req.params.courseId, req.params.moduleId, req.query);
    res.json({ success: true, data: lessons });
  } catch (error) {
    next(error);
  }
};

export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.lessonId);
    res.json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

export const createLesson = async (req, res, next) => {
  try {
    const { error, value } = createLessonSchema.validate(req.body, { abortEarly: false });
    if (error) return handleValidationError(res, error);

    const lesson = await lessonService.createLesson(req.params.courseId, req.params.moduleId, value);
    
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
    const { error, value } = updateLessonSchema.validate(req.body, { abortEarly: false });
    if (error) return handleValidationError(res, error);

    const lesson = await lessonService.updateLesson(req.params.lessonId, value);
    res.json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

export const softDeleteLesson = async (req, res, next) => {
  try {
    await lessonService.softDeleteLesson(req.params.lessonId);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const getLessonContent = async (req, res, next) => {
  try {
    const content = await lessonService.getLessonContent(req.params.lessonId, req.user);
    res.json({ success: true, data: content });
  } catch (error) {
    next(error);
  }
};
