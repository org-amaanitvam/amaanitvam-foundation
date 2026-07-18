import Task from './task.model.js'; 

// 1. FETCH TASKS (This is what broke!)
export const getAllTasks = async (req, res) => {
  try {
    // .populate() pulls the user's name/email so the frontend can display it!
    const tasks = await Task.find({}).populate('assignedTo', 'name email role').sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: 'Failed to load tasks from database' });
  }
};

// 2. CREATE A TASK
export const createTask = async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE A TASK (For your frontend 'Update' button)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};