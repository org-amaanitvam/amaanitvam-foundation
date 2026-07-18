import Announcement from "./announcement.model.js";

// 1. GET ALL ANNOUNCEMENTS
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json({ success: true, announcements }); 
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. CREATE A NEW ANNOUNCEMENT
export const createAnnouncement = async (req, res) => {
  try {
    const newAnnouncement = new Announcement(req.body);
    await newAnnouncement.save();
    res.status(201).json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE ANNOUNCEMENT (Added for the Edit button!)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};