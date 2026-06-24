import express from 'express';
import {
    createTask,
    getTasks,
    getTaskById,
    getTasksByStatus,
    getTasksByUser,
    updateTask,
    deleteTask
} from '../controllers/taskController.js';

const taskRouter = express.Router();

// Create Task
taskRouter.post('/create', createTask);

// Get All Tasks
taskRouter.get('/', getTasks);

// Get Tasks by Status
taskRouter.get('/status/:status', getTasksByStatus);

// Get Tasks Assigned to User
taskRouter.get('/user/:userId', getTasksByUser);

// Get Single Task by ID
taskRouter.get('/:id', getTaskById);

// Update Task
taskRouter.put('/:id', updateTask);

// Delete Task
taskRouter.delete('/:id', deleteTask);

export default taskRouter;
