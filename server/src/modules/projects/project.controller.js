import Project from './project.model.js';

// 1. GET ALL PROJECTS
// 1. GET ALL PROJECTS (Upgraded with Search & Filter)
export const getAllProjects = async (req, res) => {
  try {
    // 1. Start with the base query: only active, non-deleted projects
    const query = { is_deleted: false };

    // 2. Dynamically add filters if they exist in the URL query string
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // 3. Add Regex text searching for the title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' }; // 'i' makes it case-insensitive
    }

    // Add this to your dynamic filters:
    if (req.query.department_id) {
      query.department_id = req.query.department_id;
    }

    // 4. Execute the query
    const projects = await Project.find(query)
      .populate('team_member_ids', 'name email role') 
      .populate('department_id', 'name')              
      .sort({ created_at: -1 });
      
    res.json({ 
      success: true, 
      data: projects,       
      projects: projects,   
      meta: { total: projects.length }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to load projects', details: [] }
    });
  }
};

// 2. CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const newProject = await Project.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: newProject, 
      project: newProject 
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'VALIDATION_ERROR', message: error.message, details: [] }
    });
  }
};

// 3. UPDATE PROJECT (For progress bars and approvals)
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProject = await Project.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
    res.json({ 
      success: true, 
      data: updatedProject, 
      project: updatedProject 
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.message, details: [] }
    });
  }
};