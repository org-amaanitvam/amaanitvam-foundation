import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseModule'
    },
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructions: { type: String },
    due_date: { type: Date },
    max_score: { 
      type: Number, 
      default: 100, 
      min: 0,
      validate: {
        validator: Number.isFinite,
        message: '{VALUE} is not a finite number'
      }
    },
    attachment_public_ids: { type: [String] },
    is_published: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    deleted_at: {
      type: Date,
      default: null
    },
    created_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    collection: 'assignments',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Transform _id to id in JSON response
assignmentSchema.set('toJSON', {
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

export default mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
