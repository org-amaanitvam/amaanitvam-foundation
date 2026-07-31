import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Who broadcasted this message
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Quick toggle to hide it from the dashboard without deleting it
  is_active: { type: Boolean, default: true },
  
  // Standard Soft Deletes
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Transform _id to id for the frontend
announcementSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema, 'announcements');