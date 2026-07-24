import { Router } from 'express';
import { 
  getAllTasks, createTask, updateTask, reorderTasks, 
  addTaskComment, exportTasksToCSV, uploadTaskAttachments 
} from './task.controller.js';
import { upload } from '../../middleware/upload.middleware.js'; 

const router = Router();

router.get('/', getAllTasks);
router.get('/export/csv', exportTasksToCSV);
router.post('/', createTask);
router.patch('/reorder', reorderTasks);

// MUST BE HERE: The new Attachment Route
router.post('/:id/attachments', upload.array('files', 5), uploadTaskAttachments);

router.post('/:id/comments', addTaskComment);
router.put('/:id', updateTask); // <-- If attachments is below this, it will fail!

export default router;