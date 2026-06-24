import taskModel from "../models/task.js";

// Create Task
export const createTask = async(req, res) => {
    try {
        const { title, description, assignedTo, status, deadline } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        const newTask = new taskModel({
            title,
            description,
            assignedTo,
            status: status || "open",
            deadline
        });

        const task = await newTask.save();
        const populatedTask = await taskModel.findById(task._id).populate("assignedTo", "name email");
        
        res.status(201).json({ success: true, message: "Task created successfully", task: populatedTask });
    } catch (error) {
        console.log("Create Task Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Tasks
export const getTasks = async(req, res) => {
    try {
        const tasks = await taskModel.find().populate("assignedTo", "name email");
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.log("Get Tasks Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Task by ID
export const getTaskById = async(req, res) => {
    try {
        const task = await taskModel.findById(req.params.id).populate("assignedTo", "name email");

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        console.log("Get Task Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Tasks by Status
export const getTasksByStatus = async(req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ["open", "inProgress", "completed"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: `Status must be one of: ${validStatuses.join(", ")}` 
            });
        }

        const tasks = await taskModel.find({ status }).populate("assignedTo", "name email");
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.log("Get Tasks by Status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Tasks Assigned to User
export const getTasksByUser = async(req, res) => {
    try {
        const { userId } = req.params;
        const tasks = await taskModel.find({ assignedTo: userId }).populate("assignedTo", "name email");

        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.log("Get Tasks by User Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Task
export const updateTask = async(req, res) => {
    try {
        const task = await taskModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("assignedTo", "name email");

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, message: "Task updated successfully", task });
    } catch (error) {
        console.log("Update Task Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Task
export const deleteTask = async(req, res) => {
    try {
        const task = await taskModel.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        console.log("Delete Task Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
