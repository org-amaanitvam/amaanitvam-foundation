import express from 'express';
import { getAllTasks, createTask, updateTask } from './task.controller.js';

const router = express.Router();

router.get('/', getAllTasks);         // Loads the list
router.post('/', createTask);         // Assigns a new task
router.put('/:id', updateTask);       // Edits an existing task

export default router;