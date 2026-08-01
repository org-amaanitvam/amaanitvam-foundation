import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String }, // Preserved
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, 
  
  status: {
    type: String,
    default: 'open',
  },
  priority: {
    type: String,
    default: 'medium'
  },
  
  progress_percent: { type: Number, default: 0 }, // Was 'progress'
  
  // THE FIX: Preserved your strict Object ID requirement, but renamed to match conventions
  assigned_to_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  
  due_date: { type: Date }, // Was 'deadline'
  new_comment: { type: String }, // Preserved from your old 'newComment' field to prevent UI breakage
  
  // Kanban & Advanced Features
  order: { type: Number, default: 0 }, 
  category: { type: String },
  attachment_public_ids: [{ type: String }], // Cloudinary IDs only
  comments: [commentSchema], // The new standard for handling comments
  
  // Soft Delete Support
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'tasks'
});

// Transform _id to id for API responses
taskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Task || mongoose.model('Task', taskSchema);