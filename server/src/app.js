import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import adminAssetProfileCompatibilityRoutes from "./adminAssetProfileCompatibilityRoutes.js";
import adminEmergencyDataRoutes from "./adminEmergencyDataRoutes.js";
import adminCompatibilityRoutes from "./adminCompatibilityRoutes.js";
import adminLifetimeCompatibilityRoutes from "./adminLifetimeCompatibilityRoutes.js";
import adminFinalApiRoutes from "./adminFinalApiRoutes.js";

import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

// Module routes
import activityRoutes from "./modules/activities/activity.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import candidateRoutes from "./modules/candidates/candidate.routes.js";
import memberRoutes from "./modules/members/member.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import meetingRoutes from "./modules/meetings/meeting.routes.js";
import announcementRoutes from "./modules/announcements/announcement.routes.js";
import attendanceRoutes from "./modules/attendance/attendance.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import donationRoutes from "./modules/donations/donation.routes.js";
import certificateRoutes from "./modules/certificates/certificate.routes.js";
import galleryRoutes from "./modules/gallery/gallery.routes.js";
import cmsRoutes from "./modules/cms/cms.routes.js";
import libraryRoutes from "./modules/digital-library/library.routes.js";
import courseRoutes from "./modules/courses/course.routes.js";
import volunteerRoutes from "./modules/volunteers/volunteer.routes.js";
import internshipRoutes from "./modules/internships/internship.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security middleware
app.use(helmet());

const allowedOrigins = new Set(
  [
    process.env.WEBSITE_URL,
    process.env.ADMIN_PORTAL_URL,
    process.env.DASHBOARD_URL,

    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",

    "https://amaanitvam.org",
    "https://www.amaanitvam.org",
    "https://admin.amaanitvam.org",
    "https://dashboard.amaanitvam.org",
  ].filter(Boolean)
);

const corsOptions = {
  origin(origin, callback) {
    // Requests such as health checks and server-to-server calls may have no origin.
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Recovery and backward-compatibility routes
app.use(adminAssetProfileCompatibilityRoutes);
app.use(adminEmergencyDataRoutes);

// Global API rate limiter
app.use(apiLimiter);

// Compatibility endpoint used by admin/dashboard login pages
app.get("/api/public/settings", (_req, res) => {
  res.json({
    success: true,
    settings: {
      orgName: process.env.ORG_NAME || "Amaanitvam Foundation",
      enable2FA:
        String(process.env.ENABLE_2FA || "false").toLowerCase() === "true",
    },
  });
});

// Final admin recovery endpoints
app.use(adminFinalApiRoutes);

// Canonical API routes
app.use("/api/activities", activityRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/digital-library", libraryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

// Admin portal backward-compatible API aliases
app.use("/api", adminCompatibilityRoutes);
app.use("/api", adminLifetimeCompatibilityRoutes);

// Unhandled routes and errors
app.use(notFound);
app.use(errorHandler);

export default app;
