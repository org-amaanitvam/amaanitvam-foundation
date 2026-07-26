import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  topic: {
    type: String,
    trim: true,
  },
  grade: {
    type: String,
    trim: true,
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'],
    default: 'open',
  },
  assigned_faculty_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
  },
  attachments: [{ type: String }],
  tags: [{ type: String, trim: true }],
  resolved_at: {
    type: Date,
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

doubtSchema.index({ student_id: 1, created_at: -1 });
doubtSchema.index({ status: 1, created_at: -1 });
doubtSchema.index({ subject: 1, priority: 1 });
doubtSchema.index({ assigned_faculty_id: 1, status: 1 });

doubtSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

doubtSchema.virtual('responses_count', {
  ref: 'DoubtResponse',
  localField: '_id',
  foreignField: 'doubt_id',
  count: true,
});

export default mongoose.model('Doubt', doubtSchema);