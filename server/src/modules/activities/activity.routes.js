import express from 'express';
import { getActivities, createActivity } from './activity.controller.js';

const router = express.Router();

router.get('/', getActivities);
router.post('/', createActivity);

export default router;