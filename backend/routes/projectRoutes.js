import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    getDomains,
    getProjectsByDepartment
} from '../controllers/projectController.js';
import { verifyFirebaseToken, requireAdmin } from '../middleware/verifyFirebaseToken.js';

const projectRouter = express.Router();
projectRouter.use(verifyFirebaseToken);

projectRouter.post('/create', requireAdmin, createProject);
projectRouter.get('/domains', getDomains);
projectRouter.get('/department/:departmentId', getProjectsByDepartment);
projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectById);
projectRouter.put('/:id', updateProject);
projectRouter.delete('/:id', requireAdmin, deleteProject);

export default projectRouter;
