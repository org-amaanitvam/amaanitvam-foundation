import Task from '../tasks/task.model.js'; 

export const getPerformanceReport = async (req, res) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });

    const totalTasks = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'inProgress' || t.status === 'open' || t.status === 'ongoing').length;
    const pendingReview = tasks.filter(t => t.status === 'pending_approval').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    
    const taskCompletionPercentage = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

    const reportData = {
      basicDetails: {
        name: "Admin343 (AM-5707)",
        department: "Dashboard User"
      },
      metrics: {
        attendanceRate: "100%", 
        taskCompletion: `${taskCompletionPercentage}%`
      },
      appraisalSummary: {
        meetings: 1, 
        projects: 0,
        certificates: 0,
        tasksAssigned: totalTasks
      },
      taskBreakdown: {
        completed: completed,
        inProgress: inProgress,
        pendingReview: pendingReview,
        overdue: overdue 
      },
      timeline: tasks.map(t => ({
        event: `Task Assigned: ${t.title}`,
        description: t.description || "No description provided.",
        date: new Date(t.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })
      }))
    };

    // Safe JSON response envelope[cite: 18]
    res.json({ success: true, data: reportData });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};