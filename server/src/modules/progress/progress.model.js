import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true
    },
    is_completed: {
      type: Boolean,
      default: false
    },
    completed_at: {
      type: Date
    },
    time_spent_min: {
      type: Number,
      default: 0
    },
    video_progress_percent: {
      type: Number
    },
    last_position_sec: {
      type: Number
    },
    last_accessed: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'progress',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Compound Unique Index
progressSchema.index({ student_id: 1, course_id: 1, lesson_id: 1 }, { unique: true });

// Transform _id to id in JSON response
progressSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Progress || mongoose.model('Progress', progressSchema);
