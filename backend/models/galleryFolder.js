import mongoose from 'mongoose';

const galleryFolderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    coverMediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gallery',
      default: null,
    },
  },
  { timestamps: true }
);

galleryFolderSchema.index({ createdAt: -1 });

export default mongoose.models.GalleryFolder || mongoose.model('GalleryFolder', galleryFolderSchema);
