import Project from './project.model.js';

// 1. GET ALL PROJECTS
export const getAllProjects = async (req, res) => {
  try {
    // Populate pulls the actual names of the members and departments for the UI
    // Temporarily removing .populate() to bypass missing models
    const projects = await Project.find({}).sort({ createdAt: -1 });
      
    res.json({ success: true, projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, message: 'Failed to load projects' });
  }
};

// 2. CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const newProject = await Project.create(req.body);
    res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE PROJECT (For progress bars and approvals)
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};