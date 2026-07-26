import * as courseService from './course.service.js';
import { createCourseSchema, updateCourseSchema } from './course.validation.js';

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

export const getCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getCourses(req.query);
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.courseId);
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { error, value } = createCourseSchema.validate(req.body, { abortEarly: false });
    if (error) return handleValidationError(res, error);

    // Assuming req.user is set by authentication middleware
    const userId = req.user ? req.user.id : '000000000000000000000000'; 
    const course = await courseService.createCourse(value, userId);
    
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { error, value } = updateCourseSchema.validate(req.body, { abortEarly: false });
    if (error) return handleValidationError(res, error);

    const course = await courseService.updateCourse(req.params.courseId, value);
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const publishCourse = async (req, res, next) => {
  try {
    const course = await courseService.publishCourse(req.params.courseId);
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const softDeleteCourse = async (req, res, next) => {
  try {
    await courseService.softDeleteCourse(req.params.courseId);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
