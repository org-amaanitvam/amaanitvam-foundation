import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  employee_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  department: {
    type: String,
    trim: true,
  },
  specialization: [{ type: String, trim: true }],
  qualification: {
    type: String,
    trim: true,
  },
  experience_years: {
    type: Number,
    default: 0,
  },
  subjects: [{ type: String, trim: true }],
  assigned_courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  availability: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  office_hours: {
    type: String,
    trim: true,
  },
  joined_at: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

facultySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Faculty', facultySchema);