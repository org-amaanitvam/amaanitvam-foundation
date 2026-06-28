import taskModel from '../models/task.js';
import meetingModel from '../models/meeting.js';
import projectModel from '../models/project.js';
import announcementModel from '../models/announcement.js';
import userModel from '../models/user.js';

export const globalSearch = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            return res.status(400).json({ success: false, message: "Query string must be at least 2 characters long." });
        }

        const regex = new RegExp(query, 'i'); // case insensitive

        const [tasks, meetings, projects, members, announcements] = await Promise.all([
            taskModel.find({ $or: [{ title: regex }, { description: regex }] }).select('_id title description status').limit(5),
            meetingModel.find({ $or: [{ title: regex }, { description: regex }] }).select('_id title description meetingDate').limit(5),
            projectModel.find({ $or: [{ title: regex }, { description: regex }] }).select('_id title description status').limit(5),
            userModel.find({ $or: [{ name: regex }, { email: regex }, { department: regex }] }).select('_id name email role').limit(5),
            announcementModel.find({ $or: [{ title: regex }, { message: regex }] }).select('_id title message category').limit(5)
        ]);

        res.status(200).json({
            success: true,
            results: {
                tasks,
                meetings,
                projects,
                members,
                announcements
            }
        });

    } catch (error) {
        console.log("Global Search Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
