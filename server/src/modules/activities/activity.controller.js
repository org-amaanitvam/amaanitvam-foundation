import Activity from './activity.model.js';

// 1. GET RECENT ACTIVITIES (This feeds your dashboard widget!)
export const getActivities = async (req, res) => {
  try {
    // Fetches the latest 20 activities and populates the user's name
    const activities = await Activity.find({})
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
      
    res.json({ success: true, activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ success: false, message: 'Failed to load activities' });
  }
};

// 2. CREATE ACTIVITY (Utility to log new events)
export const createActivity = async (req, res) => {
  try {
    const newActivity = await Activity.create(req.body);
    res.status(201).json({ success: true, activity: newActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};