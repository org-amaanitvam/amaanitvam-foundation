import express from 'express';
import * as quizAttemptController from './quiz_attempt.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeStrict } from '../../middleware/authorize.js';
import { requireEnrollment } from '../../middleware/requireEnrollment.js';

const router = express.Router();

// POST /quizzes/:quizId/attempt
router.post(
  '/quizzes/:quizId/attempt',
  authenticate,
  authorizeStrict('student'),
  requireEnrollment,
  quizAttemptController.submitAttempt
);

// GET /quizzes/:quizId/attempts
router.get(
  '/quizzes/:quizId/attempts',
  authenticate,
  authorizeStrict('student'),
  requireEnrollment,
  quizAttemptController.getMyAttempts
);

export default router;
