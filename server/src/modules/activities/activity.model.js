import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'CREATED', 'UPDATED', 'MOVED'
  entity_type: { type: String, required: true }, // e.g., 'TASK', 'PROJECT'
  entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  description: { type: String, required: true },
  
  // The user who triggered the action
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Transform _id to id
activityLogSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema, 'activity_logs');