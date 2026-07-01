import taskModel from "../models/task.js";
import Notification from "../models/notification.js";
import { sendSMSNotification } from "../services/smsService.js";
import ActivityService from "../services/activityService.js";
import User from "../models/user.js";
// Create Task
export const createTask = async(req, res) => {
    try {
        const { title, description, project, assignedTo, status, priority, deadline } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        const newTask = new taskModel({
            title,
            description,
            project: project || null,
            assignedTo,
            status: status || "open",
            priority: priority || "medium",
            deadline
        });

        const task = await newTask.save();
        const populatedTask = await taskModel.findById(task._id).populate("assignedTo", "name email");
        
        if (assignedTo) {
            await Notification.create({
                userId: assignedTo,
                title: "New Task Assigned",
                message: `You have been assigned a new task: ${title}`,
                type: "info",
                link: "/tasks"
            });
            
            if (populatedTask.assignedTo && populatedTask.assignedTo.phone) {
                await sendSMSNotification(populatedTask.assignedTo.phone, `Amaanitvam: You have been assigned a new task '${title}'. Log in to your dashboard to view details.`);
            }
        }

        await ActivityService.log(
            "Task Created",
            `Task '${title}' was created`,
            assignedTo ? `Assigned to user` : 'Unassigned',
            req.user?._id
        );

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
        const { newComment, ...updateData } = req.body;
        
        let updateQuery = { ...updateData };
        if (newComment) {
            updateQuery.$push = { comments: { text: newComment } };
        }

        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
        
        // If a non-admin tries to set a task to completed, change it to pending_approval
        if (updateData.status === 'completed' && !isAdmin) {
            updateQuery.status = 'pending_approval';
            
            // Notify admins
   
    
    const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
    const notifications = admins.map(admin => ({
        userId: admin._id,
        title: "Task Completion Request",
        message: `${req.user.name} has requested approval for task completion.`,
        type: "alert",
        link: "/tasks"
    }));
    await Notification.insertMany(notifications);
        }
        const task = await taskModel.findByIdAndUpdate(
            req.params.id,
            updateQuery,
            { new: true, runValidators: true }
        ).populate("assignedTo", "name email");

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (updateData.status === 'completed') {
            await ActivityService.log(
                "Task Completed",
                `Task '${task.title}' was completed`,
                "",
                req.user?._id
            );
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
// Get Tasks by Project
export const getTasksByProject = async(req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await taskModel.find({ project: projectId })
            .populate("assignedTo", "name email");

        res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.log("Get Tasks by Project Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
