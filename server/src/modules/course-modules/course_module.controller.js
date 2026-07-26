import * as courseModuleService from './course_module.service.js';
import { 
  createCourseModuleSchema, 
  updateCourseModuleSchema, 
  reorderModulesSchema 
} from './course_module.validation.js';

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

export const getModulesByCourseId = async (req, res, next) => {
  try {
    const modules = await courseModuleService.getModulesByCourseId(req.params.courseId, req.query);
    res.json({ success: true, data: modules });
  } catch (error) {
    next(error);
  }
};

export const getModuleById = async (req, res, next) => {
  try {
    const courseModule = await courseModuleService.getModuleById(req.params.moduleId, req.params.courseId);
    res.json({ success: true, data: courseModule });
  } catch (error) {
    next(error);
  }
};

export const createModule = async (req, res, next) => {
  try {
    const { error, value } = createCourseModuleSchema.validate(req.body, { abortEarly: false });
    if (error) return handleValidationError(res, error);

    // Assuming req.user is set by authentication middleware
    const userId = req.user ? req.user.id : '000000000000000000000000'; 
    const courseModule = await courseModuleService.createModule(req.params.courseId, value, userId);
    
    res.status(201).json({ success: true, data: courseModule });
  } catch (error) {
    next(error);
  }
};

export const updateModule = async (req, res, next) => {
  try {
    const { error, value } = updateCourseModuleSchema.validate(req.body, { abortEarly: false });
    if (error) return handleValidationError(res, error);

    const courseModule = await courseModuleService.updateModule(req.params.moduleId, req.params.courseId, value);
    res.json({ success: true, data: courseModule });
  } catch (error) {
    next(error);
  }
};

export const softDeleteModule = async (req, res, next) => {
  try {
    await courseModuleService.softDeleteModule(req.params.moduleId, req.params.courseId);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const reorderModules = async (req, res, next) => {
  try {
    const { error, value } = reorderModulesSchema.validate(req.body, { abortEarly: false });
    if (error) return handleValidationError(res, error);

    await courseModuleService.reorderModules(req.params.courseId, value.moduleIds);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
