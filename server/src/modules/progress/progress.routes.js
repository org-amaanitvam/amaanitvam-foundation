import express from 'express';
import { completeLesson, updatePosition, getCourseSummary } from './progress.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeStrict } from '../../middleware/authorize.js';
import { requireEnrollment } from '../../middleware/requireEnrollment.js';

const router = express.Router();

router.get('/courses/:courseId', authenticate, authorizeStrict('student'), requireEnrollment, getCourseSummary);
router.post('/lessons/:lessonId/complete', authenticate, authorizeStrict('student'), requireEnrollment, completeLesson);
router.patch('/lessons/:lessonId/position', authenticate, authorizeStrict('student'), requireEnrollment, updatePosition);

export default router;
