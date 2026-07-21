import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import projectRoutes from './modules/projects/project.routes.js';
import adminRecoveryRoutes from "./routes/adminRecoveryRoutes.js";
// Import all module routes
//import settingsRoutes from "./modules/settings/settings.routes.js"; // Adjust path if needed
import activityRoutes from "./modules/activities/activity.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from './modules/users/user.routes.js';
import candidateRoutes from "./modules/candidates/candidate.routes.js";
import memberRoutes from "./modules/members/member.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import meetingRoutes from "./modules/meetings/meeting.routes.js";
import announcementRoutes from './modules/announcements/announcement.routes.js';
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
import attendanceRoutes from './modules/attendance/attendance.routes.js'; // Check your exact path!

const app = express();

import productionProfileRoutes from "./routes/productionProfile.routes.js";
// Security and utility middleware
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://admin.amaanitvam.org",
  "https://dashboard.amaanitvam.org",
  "https://amaanitvam.org",
  "https://www.amaanitvam.org",
  ...String(process.env.ADMIN_PORTAL_ORIGIN || process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

const uniqueAllowedOrigins = [...new Set(allowedOrigins)];

const corsOptions = {
  origin(origin, callback) {
    // Allow curl, health checks, same-origin and server-to-server requests.
    if (!origin || uniqueAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));


//app.use("/api/public/settings", settingsRoutes);
app.use("/api/activities", activityRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(apiLimiter);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/projects', projectRoutes);



// Compatibility endpoint used by admin/dashboard login pages.
app.get('/api/public/settings', (_req, res) => {
  res.json({
    success: true,
    settings: {
      orgName: process.env.ORG_NAME || 'Amaanitvam Foundation',
      enable2FA: String(process.env.ENABLE_2FA || 'false').toLowerCase() === 'true',
    },
  });
});

app.use("/api", productionProfileRoutes);
app.use("/api", adminRecoveryRoutes);
// API Routes
app.use("/api/auth", authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/meetings", meetingRoutes);
app.use('/api/announcements', announcementRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/donate", donationRoutes);
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


// Unhandled routes & errors
app.use(notFound);
app.use(errorHandler);

export default app;
