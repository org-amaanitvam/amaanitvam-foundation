import Project from '../projects/project.model.js';
import Task from '../tasks/task.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Build the dynamic match queries based on the URL parameters
    const projectMatch = { is_deleted: false };
    const taskMatch = { is_deleted: false };

    // Inject filters if they exist in the request
    if (req.query.department_id) {
      projectMatch.department_id = req.query.department_id;
      taskMatch.department_id = req.query.department_id; 
    }
    if (req.query.project_id) {
      taskMatch.project_id = req.query.project_id;
    }

    // 2. Execute counts with the dynamic filters
    const totalProjects = await Project.countDocuments(projectMatch);
    const totalTasks = await Task.countDocuments(taskMatch);

    // 3. Pass the dynamic taskMatch into the Aggregation Pipeline
    const taskDistribution = await Task.aggregate([
      { $match: taskMatch }, 
      { $group: { _id: "$status", count: { $sum: 1 } } } 
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          total_projects: totalProjects,
          total_tasks: totalTasks
        },
        charts: {
          task_distribution: taskDistribution
        }
      }
    });
  } catch (error) {
    console.error("Error generating dashboard stats:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to generate stats', details: [] }
    });
  }
};