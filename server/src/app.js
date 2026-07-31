import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// --- Middleware Imports ---
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

// --- Route Imports ---
import adminRecoveryRoutes from "./routes/adminRecoveryRoutes.js";
import productionProfileRoutes from "./routes/productionProfile.routes.js";
import memberAdministrationRoutes from "./modules/auth/memberAdministration.routes.js";
import adminStatsRoutes from "./modules/admin-stats/adminStats.routes.js";
import activityRoutes from "./modules/activities/activity.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from './modules/users/user.routes.js';
import candidateRoutes from "./modules/candidates/candidate.routes.js";
import memberRoutes from "./modules/members/member.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import meetingRoutes from "./modules/meetings/meeting.routes.js";
import announcementRoutes from './modules/announcements/announcement.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import donationRoutes from "./modules/donations/donation.routes.js";
import certificateRoutes from "./modules/certificates/certificate.routes.js";
import galleryRoutes from "./modules/gallery/gallery.routes.js";
import cmsRoutes from "./modules/cms/cms.routes.js";
import libraryRoutes from "./modules/digital-library/library.routes.js";
import courseRoutes from "./modules/courses/course.routes.js";
import volunteerRoutes from "./modules/volunteers/volunteer.routes.js";
import internshipRoutes from "./modules/internships/internship.routes.js";
import publicFormRoutes from "./modules/public-forms/publicForm.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'; 
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import facultyRoutes from './modules/faculty/faculty.routes.js';
import doubtRoutes from './modules/doubts/doubts.routes.js';
import internalRoutes from './modules/internal/internal.routes.js';
import conversationRoutes from './modules/conversations/conversation.routes.js';
import aiNotificationRoutes from './modules/conversations/ai-notification.routes.js';

const app = express();

// 1. Proxy Setup (Trust only local gateway)
app.set("trust proxy", "loopback");

// 2. CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
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
    if (!origin || uniqueAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Cache-Control", "Pragma", "X-Requested-With"],
  credentials: true,
};

// 3. Global Middleware (MUST come before API routes)
app.use(cors(corsOptions));
app.use(helmet());

// Super Admin member mutation routes with body limits
app.use(
  "/api/admin/members",
  express.json({ limit: "10mb" }),
  express.urlencoded({ extended: true }),
  memberAdministrationRoutes,
);

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(apiLimiter);

// 4. Public / Utility Routes
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

// 5. Core API Routes (Grouped cleanly combining your features and upstream additions)
app.use("/api/admin/members", memberAdministrationRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/admin/candidates", candidateRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/meetings", meetingRoutes);
app.use('/api/announcements', announcementRoutes);
app.use("/api/projects", projectRoutes); 
app.use("/api/activities", activityRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use("/api/donate", donationRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/digital-library", libraryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api", publicFormRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/doubts", doubtRoutes);
app.use("/internal", internalRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/ai-notifications", aiNotificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 6. Error Handling Middleware (MUST be at the very end)
app.use(notFound);
app.use(errorHandler);

export default app;