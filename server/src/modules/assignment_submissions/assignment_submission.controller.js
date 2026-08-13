import * as submissionService from './assignment_submission.service.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

const validateBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length === 0) {
    throw new BadRequestError('Invalid, missing, or non-object request body');
  }
};

export const getSubmissionsByAssignment = async (req, res, next) => {
  try {
    const submissions = await submissionService.getSubmissionsByAssignment(req.params.assignmentId);
    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    validateBody(req.body);
    
    // Extracts the user ID populated by the authentication middleware
    const gradedById = req.user.id;
    const submission = await submissionService.gradeSubmission(
      req.params.assignmentId,
      req.params.submissionId,
      req.body,
      gradedById
    );
    
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      throw new BadRequestError('Invalid, missing, or non-object request body');
    }

    const studentId = req.user.id;
    const assignmentId = req.params.assignmentId;
    const { submission_text, attachment_public_ids } = req.body;

    const submission = await submissionService.submitAssignment(
      studentId,
      assignmentId,
      submission_text,
      attachment_public_ids
    );

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};
