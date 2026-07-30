import Announcement from './announcement.model.js';

// 1. GET ACTIVE ANNOUNCEMENTS
export const getAnnouncements = async (req, res) => {
  try {
    // Only fetch announcements that are active and not deleted
    const announcements = await Announcement.find({ is_deleted: false, is_active: true })
      .sort({ created_at: -1 }); // Newest broadcasts first
      
    res.json({ 
      success: true, 
      data: announcements, 
      meta: { total: announcements.length }
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to load announcements', details: [] }
    });
  }
};

// 2. CREATE ANNOUNCEMENT
export const createAnnouncement = async (req, res) => {
  try {
    const newAnnouncement = await Announcement.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: newAnnouncement 
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'VALIDATION_ERROR', message: error.message, details: [] }
    });
  }
};

// 3. UPDATE ANNOUNCEMENT
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!updatedAnnouncement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ 
      success: true, 
      data: updatedAnnouncement 
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.message, details: [] }
    });
  }
};