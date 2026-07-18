import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String // In case older announcements used this field
  }
}, { 
  timestamps: true // THIS IS THE MAGIC KEY! It auto-generates 'createdAt'
});

export default mongoose.model("Announcement", announcementSchema);