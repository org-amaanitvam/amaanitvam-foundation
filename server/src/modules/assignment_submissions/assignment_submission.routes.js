import express from 'express';
import * as submissionController from './assignment_submission.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeStrict } from '../../middleware/authorize.js';
import { requireEnrollment } from '../../middleware/requireEnrollment.js';

const router = express.Router();

// Middleware applied per route to prevent global leakage
// List all submissions for a specific assignment
router.get(
  '/assignments/:assignmentId/submissions',
  authenticate,
  authorizeStrict('faculty'),
  submissionController.getSubmissionsByAssignment
);

// Grade a specific submission
router.put(
  '/assignments/:assignmentId/grade/:submissionId',
  authenticate,
  authorizeStrict('faculty'),
  submissionController.gradeSubmission
);

// Submit an assignment
router.post(
  '/assignments/:assignmentId/submit',
  authenticate,
  authorizeStrict('student'),
  requireEnrollment,
  submissionController.submitAssignment
);

export default router;
