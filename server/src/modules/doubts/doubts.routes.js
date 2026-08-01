import express from 'express';
import * as doubtController from './doubt.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  createSchema,
  respondSchema,
  resolveSchema,
  rateSchema,
  assignSchema,
} from './doubt.validation.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin', 'faculty', 'student'), doubtController.list);
router.get('/:doubtId', authorize('super_admin', 'admin', 'faculty', 'student'), doubtController.getById);
router.post('/', authorize('super_admin', 'admin', 'student'), validate(createSchema), doubtController.create);

router.post('/:doubtId/assign', authorize('super_admin', 'admin'), validate(assignSchema), doubtController.assign);
router.post('/:doubtId/respond', authorize('super_admin', 'admin', 'faculty'), validate(respondSchema), doubtController.respond);
router.patch('/:doubtId/resolve', authorize('super_admin', 'admin', 'faculty'), validate(resolveSchema), doubtController.resolve);
router.patch('/:doubtId/reopen', authorize('super_admin', 'admin', 'faculty'), doubtController.reopen);
router.post('/:doubtId/rate', authorize('super_admin', 'admin', 'student'), validate(rateSchema), doubtController.rate);

export default router;
