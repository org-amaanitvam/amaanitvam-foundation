import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    thumbnail_public_id: { type: String },
    category: {
      type: String,
      enum: ['academic', 'skill', 'career', 'hobby'],
      index: true
    },
    grade_level: {
      type: String,
      enum: ['grade_9', 'grade_10', 'grade_11', 'grade_12', 'ug', 'pg', 'open']
    },
    language: { type: String, default: 'english' },
    price: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    is_free: { type: Boolean, default: false },
    is_published: { type: Boolean, default: false, index: true },
    is_deleted: { type: Boolean, default: false },
    validity_days: { type: Number, default: null },
    created_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    total_modules: { type: Number, default: 0 },
    total_lessons: { type: Number, default: 0 },
    total_duration_min: { type: Number, default: 0 },
    tags: [{ type: String }]
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
