import mongoose from "mongoose";
import Gallery from "./gallery.model.js";
import GalleryFolder from "./galleryFolder.model.js";

export const getAll = async (_req, res, next) => {
    try {
        const media = await Gallery.find()
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: media,
            media,
        });
    } catch (error) {
        next(error);
    }
};

export const getFolders = async (_req, res, next) => {
    try {
        const folders = await GalleryFolder.find()
            .sort({ createdAt: -1 })
            .lean();

        const folderIds = folders.map((folder) => folder._id);

        const counts = await Gallery.aggregate([
            {
                $match: {
                    folderId: {
                        $in: folderIds,
                    },
                },
            },
            {
                $group: {
                    _id: "$folderId",
                    mediaCount: {
                        $sum: 1,
                    },
                },
            },
        ]);

        const countMap = new Map(
            counts.map((item) => [
                String(item._id),
                item.mediaCount,
            ])
        );

        const result = folders.map((folder) => ({
            ...folder,
            mediaCount: countMap.get(String(folder._id)) || 0,
        }));

        return res.status(200).json({
            success: true,
            folders: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getFolderMedia = async (req, res, next) => {
    try {
        const { folderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(folderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery folder ID.",
            });
        }

        const folder = await GalleryFolder.findById(folderId).lean();

        if (!folder) {
            return res.status(404).json({
                success: false,
                message: "Gallery folder not found.",
            });
        }

        const media = await Gallery.find({
            folderId,
        })
            .sort({ createdAt: 1 })
            .lean();

        return res.status(200).json({
            success: true,
            folder,
            media,
            images: media,
        });
    } catch (error) {
        next(error);
    }
};

export const getMedia = async (req, res, next) => {
    try {
        const { mediaId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(mediaId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid media ID.",
            });
        }

        const media = await Gallery.findById(mediaId).lean();

        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Gallery media not found.",
            });
        }

        const mediaUrl =
            media.imageUrl ||
            media.secure_url ||
            media.url;

        if (!mediaUrl) {
            return res.status(404).json({
                success: false,
                message: "Media URL is missing.",
            });
        }

        return res.redirect(mediaUrl);
    } catch (error) {
        next(error);
    }
};

// --- Create a new Folder ---
// --- Create a new Folder ---
export const createFolder = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Folder name is required.",
            });
        }

        // THE FIX: Generate a URL-friendly slug from the folder name
        // E.g., "Task Attachment: Fix API" -> "task-attachment-fix-api"
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special characters with hyphens
            .replace(/(^-|-$)+/g, '');   // Remove hyphens from the very beginning or end

        // Make it perfectly unique by attaching a timestamp
        const uniqueSlug = `${baseSlug}-${Date.now()}`;

        const folder = await GalleryFolder.create({
            name,
            slug: uniqueSlug, // Send the required slug to MongoDB!
            description: description || "",
        });

        return res.status(201).json({
            success: true,
            message: "Folder created successfully.",
            folder,
        });
    } catch (error) {
        next(error);
    }
};

// --- Upload Media to Cloudinary & Save to Mongo ---
export const uploadMedia = async (req, res, next) => {
    try {
        const { folderId, title } = req.body;

        // Check if file was caught by multer/cloudinary middleware
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided.",
            });
        }

        if (!folderId || !mongoose.Types.ObjectId.isValid(folderId)) {
            return res.status(400).json({
                success: false,
                message: "A valid folderId is required.",
            });
        }

        // Extract Cloudinary data provided by multer-storage-cloudinary
        const imageUrl = req.file.path || req.file.secure_url || req.file.url;
        const publicId = req.file.filename || req.file.public_id || "";

        const newMedia = await Gallery.create({
            folderId,
            title: title || req.file.originalname || "",
            imageUrl,
            url: imageUrl,
            secure_url: imageUrl,
            publicId,
            originalName: req.file.originalname || "",
            contentType: req.file.mimetype || "",
            mediaType: req.file.mimetype?.startsWith("video") ? "video" : "image",
        });

        return res.status(201).json({
            success: true,
            message: "Media uploaded successfully.",
            media: newMedia,
        });
    } catch (error) {
        next(error);
    }
};