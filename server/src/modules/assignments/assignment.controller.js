import * as assignmentService from './assignment.service.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

const validateBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
    throw new BadRequestError('Invalid, missing, or non-object request body');
  }
};

export const getAssignmentsByCourse = async (req, res, next) => {
  try {
    // Deliberately dropping query parameters until an explicit API contract defines them
    const assignments = await assignmentService.getAssignmentsByCourse(req.params.courseId);
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.assignmentId);
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    validateBody(req.body);
    
    // Extracts the user ID populated by the authentication middleware
    const createdById = req.user.id;
    const assignment = await assignmentService.createAssignment(
      req.params.courseId, 
      req.body, 
      createdById
    );
    
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    validateBody(req.body);
    const assignment = await assignmentService.updateAssignment(req.params.assignmentId, req.body);
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    await assignmentService.deleteAssignment(req.params.assignmentId);
    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentForStudent = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentForStudent(req.params.assignmentId);
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};
