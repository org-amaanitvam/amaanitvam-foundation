import express from 'express';
import {
    createTask,
    getTasks,
    getTaskById,
    getTasksByStatus,
    getTasksByUser,
    updateTask,
    deleteTask,
    getTasksByProject
} from '../controllers/taskController.js';
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';
import { requireMinRole } from '../middleware/rbac.js';

const taskRouter = express.Router();
taskRouter.use(verifyFirebaseToken);

// Create — admin only
taskRouter.post('/create', requireAdmin, createTask);

// Get all — admin sees all, others scoped in controller
taskRouter.get('/', getTasks);

// Filters
taskRouter.get('/status/:status', getTasksByStatus);
taskRouter.get('/project/:projectId', getTasksByProject);
taskRouter.get('/user/:userId', getTasksByUser);
taskRouter.get('/:id', getTaskById);

// Update — any authenticated user (controller gates completion approval)
taskRouter.put('/:id', updateTask);

// Delete — admin only
taskRouter.delete('/:id', requireAdmin, deleteTask);

export default taskRouter;
