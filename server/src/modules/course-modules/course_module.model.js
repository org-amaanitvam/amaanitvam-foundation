import mongoose from 'mongoose';

const courseModuleSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true
    },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true },
    is_published: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false }
  },
  { 
    collection: 'course_modules',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
  }
);



export default mongoose.models.CourseModule || mongoose.model('CourseModule', courseModuleSchema);
