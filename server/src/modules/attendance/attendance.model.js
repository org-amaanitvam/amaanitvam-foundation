import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  // THE FIX: Changed to String so it happily accepts your Firebase UID!
  userId: {
    type: String, 
    required: true,
  },
  date: {
    type: String, 
    required: true,
  },
  punchIn: {
    type: Date,
    required: true,
  },
  punchOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half-Day'],
    default: 'Present',
  },
  totalHours: {
    type: Number,
    default: 0,
  }
}, { 
  timestamps: true,
  collection: 'attendances' 
});

export default mongoose.model('Attendance', attendanceSchema);