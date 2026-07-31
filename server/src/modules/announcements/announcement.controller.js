import Announcement from './announcement.model.js';

// 1. GET ACTIVE ANNOUNCEMENTS
export const getAllAnnouncements = async (req, res) => {
  try {
    // SECURITY/LOGIC: Only fetch announcements that are active and not deleted.
    // We sort by 'created_at' descending (-1) to ensure the newest broadcasts appear first on the dashboard.
    const announcements = await Announcement.find({ is_deleted: false, is_active: true })
      .sort({ created_at: -1 }); 
      
    res.json({ 
      success: true, 
      announcements, // Expected by frontend: data.announcements
      meta: { total: announcements.length }
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: 'Failed to load announcements' }
    });
  }
};

// 2. CREATE ANNOUNCEMENT
export const createAnnouncement = async (req, res) => {
  try {
    const newAnnouncement = await Announcement.create(req.body);
    res.status(201).json({ 
      success: true, 
      announcement: newAnnouncement 
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'VALIDATION_ERROR', message: error.message }
    });
  }
};

// 3. UPDATE ANNOUNCEMENT
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // LOGIC: { new: true } (or returnDocument: "after") ensures Mongoose returns the UPDATED document, 
    // not the old one, which is required for the frontend to display changes immediately.
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    
    // ERROR HANDLING: Prevent silent failures if a user tries to edit a deleted/missing announcement
    if (!updatedAnnouncement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.json({ 
      success: true, 
      announcement: updatedAnnouncement 
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};