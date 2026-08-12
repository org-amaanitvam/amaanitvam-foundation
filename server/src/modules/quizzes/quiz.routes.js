import express from 'express';
import * as quizController from './quiz.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeStrict } from '../../middleware/authorize.js';
import { requireEnrollment } from '../../middleware/requireEnrollment.js';

const router = express.Router();

// Middleware applied per route to prevent global leakage

// POST /lessons/:lessonId/quiz
router.post(
  '/lessons/:lessonId/quiz',
  authenticate,
  authorizeStrict('faculty'),
  quizController.createQuiz
);

// PUT /quizzes/:quizId
router.put(
  '/quizzes/:quizId',
  authenticate,
  authorizeStrict('faculty'),
  quizController.updateQuiz
);

// GET /lessons/:lessonId/quiz
router.get(
  '/lessons/:lessonId/quiz',
  authenticate,
  authorizeStrict('student'),
  requireEnrollment,
  quizController.getQuizForLessonForStudent
);

export default router;
