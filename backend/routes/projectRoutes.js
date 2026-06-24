import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';

const projectRouter = express.Router();

// Create Project
projectRouter.post('/create', createProject);

// Get All Projects
projectRouter.get('/', getProjects);

// Get Single Project by ID
projectRouter.get('/:id', getProjectById);

// Update Project
projectRouter.put('/:id', updateProject);

// Delete Project
projectRouter.delete('/:id', deleteProject);

export default projectRouter;
