import Task from "./task.model.js";
import User from "../users/user.model.js";

const escapedExact = (input) =>
  new RegExp(`^${String(input || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

const allowedUserIds = async (req) => {
  if (req.userAccess?.role === "super_admin") return null;

  if (req.userAccess?.role === "department_head") {
    const department = String(req.dbUser?.department || "").trim();
    if (!department) return [];

    const users = await User.find({ department: escapedExact(department) }).select("_id");
    return users.map((user) => user._id);
  }

  return [req.dbUser._id];
};

const assertAssigneeAllowed = async (req, assignedTo) => {
  if (req.userAccess?.role === "super_admin") return;
  const ids = await allowedUserIds(req);

  if (!ids.some((id) => String(id) === String(assignedTo))) {
    const error = new Error("The selected assignee is outside your permitted scope.");
    error.statusCode = 403;
    throw error;
  }
};

// 1. GET ALL TASKS (Upgraded with Search, Status, Priority Filters, & Scope Validation)
export const getAllTasks = async (req, res) => {
  try {
    const ids = await allowedUserIds(req);
    const query = ids === null ? { is_deleted: false } : { is_deleted: false, assignedTo: { $in: ids } };

    // Local Feature: Dynamic Search and Category filters
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.category) query.category = req.query.category;
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role department")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: tasks,      // Legacy support
      tasks,            // Upstream support
      meta: { total: tasks.length }
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load tasks from the database.",
    });
  }
};

// 2. CREATE TASK
export const createTask = async (req, res) => {
  try {
    await assertAssigneeAllowed(req, req.body?.assignedTo || req.body?.assigned_to_id);
    const task = await Task.create(req.body);

    return res.status(201).json({
      success: true,
      data: task,
      task,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. UPDATE TASK
export const updateTask = async (req, res) => {
  try {
    const existing = await Task.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    await assertAssigneeAllowed(req, req.body?.assignedTo || req.body?.assigned_to_id || existing.assignedTo);

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true }
    );

    return res.json({
      success: true,
      data: task,
      task,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. BULK REORDER TASKS (Kanban Switchyard)
export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ success: false, message: 'Payload must be an array of tasks.' });
    }

    const bulkOperations = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task.id },
        update: { status: task.status, order: task.order }
      }
    }));

    await Task.bulkWrite(bulkOperations);
    return res.status(200).json({ success: true, message: "Board synchronized successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 5. ADD TASK COMMENT
export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, created_by_id } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $push: { comments: { text, created_by_id } } },
      { returnDocument: 'after' }
    ).populate('comments.created_by_id', 'name email');

    return res.status(201).json({ success: true, data: updatedTask, task: updatedTask });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 6. EXPORT TASKS TO CSV
export const exportTasksToCSV = async (req, res) => {
  try {
    const tasks = await Task.find({ is_deleted: false }).populate('assignedTo', 'name email');
    
    let csvData = "Task Title,Status,Priority,Due Date,Assigned To\n";
    tasks.forEach(task => {
      const assigned = task.assignedTo ? task.assignedTo.name : 'Unassigned';
      const date = task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A';
      csvData += `"${task.title}",${task.status},${task.priority},${date},${assigned}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks-report.csv"');
    return res.status(200).send(csvData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 7. UPLOAD TASK ATTACHMENTS (Cloudinary Integration)
export const uploadTaskAttachments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided." });
    }

    const fileUrls = req.files.map(file => file.path);
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $push: { attachment_public_ids: { $each: fileUrls } } },
      { returnDocument: 'after' }
    );

    return res.status(200).json({ success: true, data: updatedTask });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};