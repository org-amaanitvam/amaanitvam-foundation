import Task from './task.model.js'; 

// 1. FETCH TASKS (Upgraded with Search & Filter)
export const getAllTasks = async (req, res) => {
  try {
    // 1. Base query
    const query = { is_deleted: false };

    // 2. Dynamic exact-match filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.category) query.category = req.query.category;
    if (req.query.project_id) query.project_id = req.query.project_id; // Filter tasks by project

    // 3. Dynamic text search
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    // 4. Execute
    const tasks = await Task.find(query)
      .populate('assigned_to_id', 'name email role') 
      .sort({ created_at: -1 });
      
    res.json({ 
      success: true, 
      data: tasks, 
      tasks: tasks, 
      meta: { total: tasks.length }
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to load tasks from database', details: [] }
    });
  }
};

// 2. CREATE A TASK
export const createTask = async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: newTask, 
      task: newTask 
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'VALIDATION_ERROR', message: error.message, details: [] }
    });
  }
};

// 3. UPDATE A TASK (For your frontend 'Update' button & Kanban drag)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    res.json({ 
      success: true, 
      data: updatedTask, 
      task: updatedTask 
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.message, details: [] } 
    });
  }
};

// 4. BULK REORDER TASKS (The Kanban Switchyard)
export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; 
    // Expecting an array like: [{ id: "64b...", status: "inProgress", order: 1 }, ...]

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Payload must be an array of tasks.', details: [] } 
      });
    }

    // Build the bulk operations payload for Mongoose
    const bulkOperations = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task.id }, // Find the specific task
        update: { 
          status: task.status, 
          order: task.order 
        }
      }
    }));

    // Execute all updates in a single database transaction!
    await Task.bulkWrite(bulkOperations);

    res.status(200).json({ 
      success: true, 
      data: { message: "Board synchronized successfully" },
      meta: { updated_count: tasks.length }
    });
  } catch (error) {
    console.error("Error reordering tasks:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.message, details: [] } 
    });
  }
};

// 5. ADD TASK COMMENT (The Communication Line)
export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params; // The Task ID
    const { text, created_by_id } = req.body; // The comment payload

    if (!text || !created_by_id) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Comment text and creator ID are required.', details: [] } 
      });
    }

    // $push atomically adds the comment to the array without pulling the whole document into memory
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $push: { comments: { text, created_by_id } } },
      { returnDocument: 'after' }
    ).populate('comments.created_by_id', 'name email'); // Populate the commenter's details for the UI

    res.status(201).json({ 
      success: true, 
      data: updatedTask,
      task: updatedTask // Legacy UI fallback
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.message, details: [] } 
    });
  }
};

// ==========================================
// 6. EXPORT TASKS TO CSV
// ==========================================
export const exportTasksToCSV = async (req, res) => {
  try {
    const tasks = await Task.find({ is_deleted: false }).populate('assigned_to_id', 'name email');
    
    // Build CSV Headers
    let csvData = "Task Title,Status,Priority,Due Date,Assigned To\n";
    
    // Add Rows
    tasks.forEach(task => {
      const assigned = task.assigned_to_id ? task.assigned_to_id.name : 'Unassigned';
      const date = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A';
      csvData += `"${task.title}",${task.status},${task.priority},${date},${assigned}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks-report.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    console.error("CSV Export error:", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// ==========================================
// 7. UPLOAD TASK ATTACHMENTS (CLOUDINARY)
// ==========================================
export const uploadTaskAttachments = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Multer places the Cloudinary file data in req.files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: { message: "No files provided." } });
    }

    // Extract the secure URLs generated by Cloudinary
    const fileUrls = req.files.map(file => file.path);

    // Push the URLs into the task's attachment_public_ids array
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $push: { attachment_public_ids: { $each: fileUrls } } },
      { returnDocument: 'after' }
    );

    res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};