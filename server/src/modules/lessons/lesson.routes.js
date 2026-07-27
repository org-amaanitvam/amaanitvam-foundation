import express from 'express';
import {
  getLessonsByModuleId,
  getLessonById,
  createLesson,
  updateLesson,
  softDeleteLesson,
  getLessonContent
} from './lesson.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getLessonsByModuleId);
router.get('/:lessonId', getLessonById);

// Protected routes (Authenticated Users)
router.use(authenticate);
router.get('/:lessonId/content', getLessonContent);

// Protected routes (Admin / Faculty / Super Admin)
router.use(authorize('admin', 'faculty', 'super_admin'));

router.post('/', createLesson);
router.put('/:lessonId', updateLesson);
router.delete('/:lessonId', softDeleteLesson);

export default router;
