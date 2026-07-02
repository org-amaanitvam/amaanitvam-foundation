import express from 'express';
import { getRecentActivities } from '../controllers/activityController.js';

const activityRouter = express.Router();
activityRouter.get('/', getRecentActivities);
export default activityRouter;
