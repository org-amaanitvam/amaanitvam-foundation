import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { requireDashboardAccess, requireRole } from "../../middleware/dashboardAccess.js";
import { upload } from "../../middleware/upload.middleware.js"; // Or upload.js depending on which file handles multer

import {
    getAll,
    getFolders,
    getFolderMedia,
    getMedia,
    createFolder,
    uploadMedia,
} from "./gallery.controller.js";

const router = express.Router();

// Public Read Routes
router.get("/", getAll);
router.get("/folders", getFolders);
router.get("/folders/:folderId/media", getFolderMedia);
router.get("/media/:mediaId", getMedia);

// Protected Admin Upload Routes
router.post(
    "/folders",
    authenticate,
    requireDashboardAccess,
    requireRole("admin", "super_admin"),
    createFolder
);

router.post(
    "/upload",
    authenticate,
    requireDashboardAccess,
    requireRole("admin", "super_admin"),
    upload.single("image"), // 'image' is the form field name for the file
    uploadMedia
);

export default router;