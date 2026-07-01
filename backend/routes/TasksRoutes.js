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
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';
import taskModel from '../models/task.js'; // Direct import to fix the missing controller function safely

const taskRouter = express.Router();

taskRouter.use(verifyFirebaseToken);

// 1. Create Task
taskRouter.post('/create', requireAdmin, createTask);

// 2. Get All Tasks
taskRouter.get('/', getTasks);

// 3. Get Tasks by Status
taskRouter.get('/status/:status', getTasksByStatus);

// 4. Get Tasks Assigned to User
taskRouter.get('/user/:userId', getTasksByUser);

// 5. Get Tasks by Project (MOVED ABOVE /:id TO ELIMINATE ROUTE COLLISION BUG)
taskRouter.get('/project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        // Queries tasks mapped to this project field safely
        const tasks = await taskModel.find({ project: projectId }).populate("assignedTo", "name email");
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. Get Single Task by ID
taskRouter.get('/:id', getTaskById);

// 7. Update Task
taskRouter.put('/:id', updateTask);

// 8. Delete Task
taskRouter.delete('/:id', requireAdmin, deleteTask);

export default taskRouter;
