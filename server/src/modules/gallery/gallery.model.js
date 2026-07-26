import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
    {
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GalleryFolder",
            required: true,
            index: true,
        },

        title: {
            type: String,
            trim: true,
            default: "",
        },

        mediaType: {
            type: String,
            enum: ["image", "video"],
            default: "image",
        },

        imageUrl: {
            type: String,
            trim: true,
            default: "",
        },

        url: {
            type: String,
            trim: true,
            default: "",
        },

        secure_url: {
            type: String,
            trim: true,
            default: "",
        },

        publicId: {
            type: String,
            trim: true,
            default: "",
        },

        originalName: {
            type: String,
            trim: true,
            default: "",
        },

        contentType: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

gallerySchema.index({ folderId: 1, createdAt: 1 });

export default mongoose.models.Gallery ||
    mongoose.model("Gallery", gallerySchema, "gallery");