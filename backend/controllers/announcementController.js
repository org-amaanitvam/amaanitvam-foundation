import mongoose from "mongoose";
import announcementModel from "../models/announcement.js";
import Notification from "../models/notification.js";

// Create Announcement
export const createAnnouncement = async(req, res) => {
    try {
        const { title, message, category, priority, createdBy, expiryDate } = req.body;
        const authorId = createdBy || req.user?._id || req.user?.id;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "Title and message are required"
            });
        }

        if (authorId && !mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({
                success: false,
                message: "createdBy must be a valid user id"
            });
        }

        const announcementData = {
            title,
            message,
            category: category || "General",
            priority: priority || "Medium",
            expiryDate
        };

        if (authorId) {
            announcementData.createdBy = authorId;
        }

        const newAnnouncement = new announcementModel(announcementData);

        const announcement = await newAnnouncement.save();
        const populatedAnnouncement = await announcementModel.findById(announcement._id).populate("createdBy", "name email");
        
        await Notification.create({
            title: "New Announcement",
            message: title,
            type: priority === "High" ? "emergency" : "info"
        });

        res.status(201).json({ success: true, message: "Announcement created successfully", announcement: populatedAnnouncement });
    } catch (error) {
        console.log("Create Announcement Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Announcements
export const getAnnouncements = async(req, res) => {
    try {
        const announcements = await announcementModel.find({ isActive: true }).populate("createdBy", "name email").sort({ createdAt: -1 });
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.log("Get Announcements Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Announcements by Category
export const getAnnouncementsByCategory = async(req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ["Meeting", "Deadline", "Recruitment", "Policy", "Deployment", "Event", "General"];

        if (!validCategories.includes(category)) {
            return res.status(400).json({ 
                success: false, 
                message: `Category must be one of: ${validCategories.join(", ")}` 
            });
        }

        const announcements = await announcementModel.find({ category, isActive: true }).populate("createdBy", "name email").sort({ createdAt: -1 });
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.log("Get Announcements by Category Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Announcements by Priority
export const getAnnouncementsByPriority = async(req, res) => {
    try {
        const { priority } = req.params;
        const validPriorities = ["Low", "Medium", "High"];

        if (!validPriorities.includes(priority)) {
            return res.status(400).json({ 
                success: false, 
                message: `Priority must be one of: ${validPriorities.join(", ")}` 
            });
        }

        const announcements = await announcementModel.find({ priority, isActive: true }).populate("createdBy", "name email").sort({ createdAt: -1 });
        res.status(200).json({ success: true, announcements });
    } catch (error) {
        console.log("Get Announcements by Priority Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Announcement by ID
export const getAnnouncementById = async(req, res) => {
    try {
        const announcement = await announcementModel.findById(req.params.id).populate("createdBy", "name email");

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        res.status(200).json({ success: true, announcement });
    } catch (error) {
        console.log("Get Announcement Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Announcement
export const updateAnnouncement = async(req, res) => {
    try {
        const announcement = await announcementModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("createdBy", "name email");

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        res.status(200).json({ success: true, message: "Announcement updated successfully", announcement });
    } catch (error) {
        console.log("Update Announcement Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Deactivate/Archive Announcement (Soft Delete)
export const deactivateAnnouncement = async(req, res) => {
    try {
        const announcement = await announcementModel.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        res.status(200).json({ success: true, message: "Announcement deactivated successfully" });
    } catch (error) {
        console.log("Deactivate Announcement Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Announcement (Hard Delete)
export const deleteAnnouncement = async(req, res) => {
    try {
        const announcement = await announcementModel.findByIdAndDelete(req.params.id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: "Announcement not found" });
        }

        res.status(200).json({ success: true, message: "Announcement deleted successfully" });
    } catch (error) {
        console.log("Delete Announcement Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
