import * as submissionRepo from './assignment_submission.repository.js';
import * as assignmentRepo from '../assignments/assignment.repository.js';
import { AppError, NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';

export const getSubmissionsByAssignment = async (assignmentId) => {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  return submissionRepo.findAllByAssignmentId(assignmentId);
};

export const gradeSubmission = async (assignmentId, submissionId, gradeData, gradedById) => {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) {
    throw new NotFoundError('Assignment not found');
  }

  const submission = await submissionRepo.findById(submissionId);
  if (!submission) {
    throw new NotFoundError('Assignment submission not found');
  }

  if (String(submission.assignment_id) !== String(assignmentId)) {
    throw new BadRequestError('Submission does not belong to the specified assignment');
  }

  const score = gradeData.score;
  if (score === undefined || score === null || typeof score !== 'number' || !Number.isFinite(score)) {
    throw new BadRequestError('Score must be a finite number');
  }

  const maxScore = assignment.max_score ?? 100;
  if (score < 0 || score > maxScore) {
    throw new BadRequestError(`Score must be between 0 and ${maxScore}`);
  }

  const updateData = {
    score: score,
    feedback: gradeData.feedback,
    status: 'graded',
    graded_by_id: gradedById,
    graded_at: new Date()
  };

  return submissionRepo.update(submissionId, updateData);
};

export const submitAssignment = async (studentId, assignmentId, text, attachments) => {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment || !assignment.is_published) {
    throw new NotFoundError('Assignment not found');
  }

  const existingSubmission = await submissionRepo.findOwnSubmission(studentId, assignmentId);
  if (existingSubmission) {
    throw new AppError('Assignment already submitted', 409, 'ASSIGNMENT_ALREADY_SUBMITTED');
  }

  if (text !== undefined && text !== null) {
    if (typeof text !== 'string') {
      throw new BadRequestError('submission_text must be a string');
    }
    if (text.trim().length === 0) {
      throw new BadRequestError('submission_text cannot be empty');
    }
  }

  if (attachments !== undefined && attachments !== null) {
    if (!Array.isArray(attachments) || !attachments.every(a => typeof a === 'string')) {
      throw new BadRequestError('attachment_public_ids must be an array of strings');
    }
    if (attachments.length === 0) {
      throw new BadRequestError('attachment_public_ids cannot be empty');
    }
  }

  const hasText = text !== undefined && text !== null;
  const hasAttachments = attachments !== undefined && attachments !== null;

  if (!hasText && !hasAttachments) {
    throw new BadRequestError('Submission must contain either text or at least one attachment');
  }

  const submissionData = {
    assignment_id: assignmentId,
    student_id: studentId,
    course_id: assignment.course_id,
    submission_text: text,
    attachment_public_ids: attachments,
    status: 'submitted'
  };

  try {
    return await submissionRepo.create(submissionData);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Assignment already submitted', 409, 'ASSIGNMENT_ALREADY_SUBMITTED');
    }
    throw error;
  }
};
