import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  
  meeting_date: { type: Date, required: true },
  meeting_link: { type: String }, 
  
  organizer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendee_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Standard Soft Deletes
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Transform _id to id for the frontend
meetingSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema, 'meetings');