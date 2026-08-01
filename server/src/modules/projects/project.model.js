import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  due_date: { type: Date, required: true },
  completed: { type: Boolean, default: false }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  progress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'ongoing'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  // Assigned members reference for team collaboration
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Department association reference
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  // Local feature: Milestone task breakdown list
  milestones: [milestoneSchema],
  
  // Soft Delete Support flags
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'projects'
});

// CRITICAL FIX: Transform MongoDB _id to standard API id string for frontend compatibility
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