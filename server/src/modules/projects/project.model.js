import mongoose from 'mongoose';

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
    // THE FIX: Added the lowercase 'on hold' to match exactly what your form is sending!
    //enum: ['ongoing', 'completed', 'pending_approval', 'On Hold', 'on hold', 'Active', 'Pending'],
    default: 'ongoing'
  },
  startDate: { 
    type: Date 
  },
  endDate: { 
    type: Date 
  },
  // Matches your assignedMembers array in React
  assignedMembers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department' 
  }
}, { 
  timestamps: true,
  collection: 'projects'
});

export default mongoose.model('Project', projectSchema);