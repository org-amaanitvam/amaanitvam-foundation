import ActivityLog from './activity.model.js';

// GET RECENT ACTIVITY FOR THE DASHBOARD
export const getRecentActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user_id', 'name email')
      .sort({ created_at: -1 })
      .limit(50); // Only pull the last 50 events so we don't crash the UI
      
    res.json({ 
      success: true, 
      data: logs, 
      meta: { total: logs.length }
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to load logs', details: [] }
    });
  }
};