import express from 'express';
import { getAllProjects, createProject, updateProject } from './project.controller.js';

const router = express.Router();

router.get('/', getAllProjects);

// THE FIX: We map BOTH routes to the exact same create function!
router.post('/', createProject);       // Catches the Dashboard widget form
router.post('/create', createProject); // Catches the dedicated ProjectsPage form

router.put('/:id', updateProject);

export default router;