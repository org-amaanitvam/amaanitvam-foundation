import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['open', 'inProgress', 'pending_approval', 'completed', 'overdue'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  progress: { type: Number, default: 0 },
  // THE FIX: This tells MongoDB to grab the actual user details, not just a string!
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Ensure this matches the name of your User model!
    required: true,
  },
  deadline: { type: Date },
  newComment: { type: String }
}, { 
  timestamps: true,
  collection: 'tasks'
});

export default mongoose.model('Task', taskSchema);