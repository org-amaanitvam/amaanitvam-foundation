import projectModel from "../models/project.js";
import Department from "../models/department.js";
import Notification from "../models/notification.js";
import ActivityService from "../services/activityService.js";
import User from "../models/user.js";

// Create Project
export const createProject = async (req, res) => {
    try {
        const { title, description, department, progress, status, assignedMembers, startDate, endDate } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        const newProject = new projectModel({
            title,
            description,
            department: department || null,
            startDate,
            endDate,
            progress: progress || 0,
            status: status || "ongoing",
            assignedMembers: assignedMembers || []
        });

        const project = await newProject.save();

        await Notification.create({
            title: "New Project Started",
            message: `A new project '${title}' has been launched!`,
            type: "success",
            link: "/projects"
        });

        res.status(201).json({ success: true, message: "Project created successfully", project });
    } catch (error) {
        console.log("Create Project Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Projects
export const getProjects = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            query = { assignedMembers: req.user._id };
        }
        const projects = await projectModel.find(query)
            .populate('assignedMembers', 'name email')
            .populate('department', 'departmentName');

        res.status(200).json({ success: true, projects });
    } catch (error) {
        console.log("Get Projects Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Project by ID
export const getProjectById = async (req, res) => {
    try {
        const project = await projectModel.findById(req.params.id)
            .populate('assignedMembers', 'name email')
            .populate('department', 'departmentName');

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.status(200).json({ success: true, project });
    } catch (error) {
        console.log("Get Project Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Project
export const updateProject = async (req, res) => {
    try {
        let updateData = { ...req.body };
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

        if ((updateData.status === 'completed' || updateData.progress === 100 || updateData.progress === '100') && !isAdmin) {
            updateData.status = 'pending_approval';

            const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } });
            const notifications = admins.map(admin => ({
                userId: admin._id,
                title: "Project Completion Request",
                message: `${req.user.name} has requested approval for project completion.`,
                type: "alert",
                link: "/projects"
            }));
            await Notification.insertMany(notifications);
        }

        const project = await projectModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('assignedMembers', 'name email')
         .populate('department', 'departmentName');

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        await ActivityService.log(
            "Project Updated",
            `Project '${project.title}' was updated`,
            "",
            req.user?._id
        );

        res.status(200).json({ success: true, message: "Project updated successfully", project });
    } catch (error) {
        console.log("Update Project Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Project
export const deleteProject = async (req, res) => {
    try {
        const project = await projectModel.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.log("Delete Project Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Domains (departments that have at least one project)
export const getDomains = async (req, res) => {
    try {
        const departmentIds = await projectModel.distinct("department");
        const domains = await Department.find({
            _id: { $in: departmentIds.filter(Boolean) }
        }).select("departmentName description");

        res.status(200).json({ success: true, domains });
    } catch (error) {
        console.log("Get Domains Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Projects by Department
export const getProjectsByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const projects = await projectModel.find({ department: departmentId })
            .populate('assignedMembers', 'name email');

        res.status(200).json({ success: true, projects });
    } catch (error) {
        console.log("Get Projects by Department Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
