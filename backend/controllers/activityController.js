import Activity from '../models/activity.js';

export const getRecentActivities = async (req, res) => {
    try {
        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('performedBy', 'name');
        res.status(200).json({ success: true, activities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
