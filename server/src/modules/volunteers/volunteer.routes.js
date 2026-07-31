import express from "express";
import { upload } from "../../middleware/upload.js";
import { authenticate } from "../../middleware/authenticate.js";
import {
  requireDashboardAccess,
  requireRole,
} from "../../middleware/dashboardAccess.js";
import {
  getAll,
  submitVolunteerApplication,
} from "./volunteer.controller.js";

const router = express.Router();

const uploadResume = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (!error) return next();

    return res.status(400).json({
      success: false,
      message: error.message || "The resume file could not be uploaded.",
    });
  });
};

router.post("/apply", uploadResume, submitVolunteerApplication);

router.get(
  "/",
  authenticate,
  requireDashboardAccess,
  requireRole("super_admin"),
  getAll,
);

export default router;
