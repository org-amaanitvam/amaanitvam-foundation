import express from 'express';
import * as assignmentController from './assignment.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeStrict } from '../../middleware/authorize.js';
import { requireEnrollment } from '../../middleware/requireEnrollment.js';
const router = express.Router();

// Middleware applied per route to prevent global leakage
// List assignments for a course
router.get(
  '/courses/:courseId/assignments',
  authenticate,
  authorizeStrict('faculty'),
  assignmentController.getAssignmentsByCourse
);

// Create an assignment for a course
router.post(
  '/courses/:courseId/assignments',
  authenticate,
  authorizeStrict('faculty'),
  assignmentController.createAssignment
);

// Get a specific assignment
router.get(
  '/assignments/:assignmentId',
  authenticate,
  authorizeStrict('faculty'),
  assignmentController.getAssignmentById
);

// Update a specific assignment
router.put(
  '/assignments/:assignmentId',
  authenticate,
  authorizeStrict('faculty'),
  assignmentController.updateAssignment
);

// Soft delete an assignment
router.delete(
  '/assignments/:assignmentId',
  authenticate,
  authorizeStrict('faculty'),
  assignmentController.deleteAssignment
);

// Get assignment for enrolled student
router.get(
  '/assignments/:assignmentId/student',
  authenticate,
  authorizeStrict('student'),
  requireEnrollment,
  assignmentController.getAssignmentForStudent
);

export default router;
