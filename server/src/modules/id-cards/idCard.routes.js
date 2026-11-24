import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getNextIdPreview,
  listIdCards,
  createIdCard,
} from './idCard.controller.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/next', getNextIdPreview);
router.get('/', listIdCards);
router.post('/', createIdCard);

export default router;