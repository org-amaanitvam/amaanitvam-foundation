import meetingModel from "../models/meeting.js";
import Notification from "../models/notification.js";

// Create Meeting
export const createMeeting = async(req, res) => {
    try {
        const { title, description, meetingDate, attendees } = req.body;

        if (!title || !meetingDate) {
            return res.status(400).json({
                success: false,
                message: "Title and meetingDate are required"
            });
        }

        const newMeeting = new meetingModel({
            title,
            description,
            meetingDate,
            attendees
        });

        const meeting = await newMeeting.save();
        
        if (attendees && attendees.length > 0) {
            const notifications = attendees.map(userId => ({
                userId,
                title: "New Meeting Scheduled",
                message: `You are invited to a new meeting '${title}' on ${new Date(meetingDate).toLocaleString()}`,
                type: "info"
            }));
            await Notification.insertMany(notifications);
        } else {
            await Notification.create({
                title: "New Meeting Scheduled",
                message: `A new meeting '${title}' has been scheduled for ${new Date(meetingDate).toLocaleString()}`,
                type: "info"
            });
        }

        res.status(201).json({ success: true, meeting });
    } catch (error) {
        console.log("Create Meeting Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Meetings
export const getMeetings = async(req, res) => {
    try {
        const meetings = await meetingModel.find()
            .populate("attendees", "name email");

        res.status(200).json({ success: true, meetings });
    } catch (error) {
        console.log("Get Meetings Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Meeting by ID
export const getMeetingById = async(req, res) => {
    try {
        const meeting = await meetingModel.findById(req.params.id)
            .populate("attendees", "name email");

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        res.status(200).json({ success: true, meeting });
    } catch (error) {
        console.log("Get Meeting Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Meeting
export const updateMeeting = async(req, res) => {
    try {
        const meeting = await meetingModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("attendees", "name email");

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        res.status(200).json({ success: true, message: "Meeting updated successfully", meeting });
    } catch (error) {
        console.log("Update Meeting Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Meeting
export const deleteMeeting = async(req, res) => {
    try {
        const meeting = await meetingModel.findByIdAndDelete(req.params.id);
        
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        res.status(200).json({ success: true, message: "Meeting deleted successfully" });
    } catch (error) {
        console.log("Delete Meeting Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
