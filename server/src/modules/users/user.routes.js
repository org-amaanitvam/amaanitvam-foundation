import express from 'express';
import * as userController from './user.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { updateProfileSchema } from './user.validation.js';

const router = express.Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.put('/me', validate(updateProfileSchema), userController.updateMe);

router.use(authorize('super_admin', 'admin'));

router.get('/', userController.listUsers);
router.get('/:userId', userController.getUserById);
router.patch('/:userId/status', userController.updateUserStatus);

export default router;