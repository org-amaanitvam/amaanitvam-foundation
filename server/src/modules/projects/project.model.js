import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  due_date: { type: Date, required: true }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String }, // Preserved from existing code
  progress_percent: { type: Number, default: 0 }, // Was 'progress'
  
  status: {
    type: String,
    // Enums disabled to match your current setup and prevent validation errors
    default: 'ongoing' // Preserved your default
  },
  
  start_date: { type: Date }, // Was 'startDate'
  end_date: { type: Date },   // Was 'endDate'
  
  // FK Naming Convention: {entity}_id
  team_member_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Was 'assignedMembers'
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // Was 'department'
  
  milestones: [milestoneSchema],
  
  // Soft Delete Support
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null }
}, { 
  // Maps mongoose timestamps to our snake_case standard
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'projects'
});

// CRITICAL FIX: Transform MongoDB _id to standard API id string
projectSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);