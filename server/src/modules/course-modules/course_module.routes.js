import express from 'express';
import {
  getModulesByCourseId,
  getModuleById,
  createModule,
  updateModule,
  softDeleteModule,
  reorderModules
} from './course_module.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getModulesByCourseId);
router.get('/:moduleId', getModuleById);

// Protected routes (Admin / Faculty)
router.use(authenticate);
router.use(authorize('admin', 'faculty', 'super_admin'));

router.post('/', createModule);
router.patch('/reorder', reorderModules);
router.put('/:moduleId', updateModule);
router.delete('/:moduleId', softDeleteModule);

export default router;
