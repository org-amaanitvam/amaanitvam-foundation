import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GalleryFolder',
      default: null,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      default: 'image/jpeg',
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
      index: true,
    },
    originalName: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

gallerySchema.index({ folderId: 1, createdAt: -1 });
gallerySchema.index({ mediaType: 1, createdAt: -1 });

export default mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
