import projectModel from "../models/project.js";

// Create Project
export const createProject = async(req, res) => {
    try {
        const { title, description, progress, status } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }
        
        const newProject = new projectModel({
            title,
            description,
            progress: progress || 0,
            status: status || "ongoing"
        });

        const project = await newProject.save();
        res.status(201).json({ success: true, message: "Project created successfully", project });
    } catch (error) {
        console.log("Create Project Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Projects
export const getProjects = async(req, res) => {
    try {
        const projects = await projectModel.find();
        res.status(200).json({ success: true, projects });
    } catch (error) {
        console.log("Get Projects Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Project by ID
export const getProjectById = async(req, res) => {
    try {
        const project = await projectModel.findById(req.params.id);

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
export const updateProject = async(req, res) => {
    try {
        const project = await projectModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        res.status(200).json({ success: true, message: "Project updated successfully", project });
    } catch (error) {
        console.log("Update Project Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Project
export const deleteProject = async(req, res) => {
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
