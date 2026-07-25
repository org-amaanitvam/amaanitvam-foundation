import express from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, publishCourse, softDeleteCourse } from './course.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:courseId', getCourseById);

// Protected routes (Admin / Faculty)
router.use(authenticate);
router.use(authorize('admin', 'faculty', 'super_admin')); // We include super_admin based on the authorize middleware logic, though it inherently passes

router.post('/', createCourse);
router.put('/:courseId', updateCourse);
router.delete('/:courseId', softDeleteCourse);
router.patch('/:courseId/publish', publishCourse);

export default router;
