import express from "express";

import {
    getAll,
    getFolders,
    getFolderMedia,
    getMedia,
} from "./gallery.controller.js";

const router = express.Router();

router.get("/", getAll);

router.get("/folders", getFolders);

router.get(
    "/folders/:folderId/media",
    getFolderMedia
);

router.get(
    "/media/:mediaId",
    getMedia
);

export default router;