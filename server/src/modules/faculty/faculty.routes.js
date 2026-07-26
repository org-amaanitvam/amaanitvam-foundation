import express from 'express';
import * as facultyController from './faculty.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { createSchema, updateSchema, statusSchema, bulkImportSchema } from './faculty.validation.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin'), facultyController.list);
router.get('/:facultyId', authorize('super_admin', 'admin', 'faculty'), facultyController.getById);
router.post('/', authorize('super_admin', 'admin'), validate(createSchema), facultyController.create);
router.put('/:facultyId', authorize('super_admin', 'admin'), validate(updateSchema), facultyController.update);
router.patch('/:facultyId/status', authorize('super_admin'), validate(statusSchema), facultyController.updateStatus);
router.get('/:facultyId/stats', authorize('super_admin', 'admin', 'faculty'), facultyController.getStats);
router.post('/import', authorize('super_admin', 'admin'), validate(bulkImportSchema), facultyController.bulkImport);

export default router;