import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'system' }, // e.g., 'task_assigned', 'mention'
  is_read: { type: Boolean, default: false },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

notificationSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; return ret; }});
export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema, 'notifications');