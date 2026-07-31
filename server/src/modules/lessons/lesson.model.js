import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseModule',
      required: true
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    title: { type: String, required: true },
    lesson_type: {
      type: String,
      enum: ['video', 'text', 'pdf']
    },
    content_public_id: { type: String },
    content_text: { type: String },
    duration_min: { type: Number },
    order: { type: Number, required: true },
    is_preview: { type: Boolean, default: false },
    is_published: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false }
  },
  { 
    collection: 'lessons',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
  }
);

export default mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
