import express from 'express';
import { completeLesson, updatePosition, getCourseSummary } from './progress.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

// All progress routes require authentication
router.use(authenticate);

// Course summary route (requires only authentication)
router.get('/courses/:courseId', getCourseSummary);

// Lesson progress modification routes (requires specific roles)
router.post('/lessons/:lessonId/complete', authorize('student', 'admin', 'super_admin'), completeLesson);
router.patch('/lessons/:lessonId/position', authorize('student', 'admin', 'super_admin'), updatePosition);

export default router;
