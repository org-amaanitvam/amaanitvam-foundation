import { Router } from 'express';
import * as enrollmentController from './enrollment.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeStrict } from '../../middleware/authorize.js';

const router = Router();

router.post(
  '/courses/:courseId/enroll',
  authenticate,
  authorizeStrict('student'),
  enrollmentController.enroll
);

router.get(
  '/courses/:courseId/enrollment',
  authenticate,
  authorizeStrict('student'),
  enrollmentController.getMyEnrollment
);

router.get(
  '/enrollments/my',
  authenticate,
  authorizeStrict('student'),
  enrollmentController.getMyEnrollments
);

export default router;
