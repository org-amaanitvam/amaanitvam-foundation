import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  actionType: { 
    type: String, 
    required: true,
    enum: [
      'Meeting Scheduled', 
      'Meeting Minutes Uploaded', 
      'Task Created', 
      'Task Completed', 
      'Announcement Created', 
      'Project Updated',
      'Other'
    ],
    default: 'Other'
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true, // This automatically creates the 'createdAt' timestamp for your timeAgo function!
  collection: 'activities'
});

export default mongoose.model('Activity', activitySchema);