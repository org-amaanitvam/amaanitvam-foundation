import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

// Import all module routes
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import candidateRoutes from "./modules/candidates/candidate.routes.js";
import memberRoutes from "./modules/members/member.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import meetingRoutes from "./modules/meetings/meeting.routes.js";
import announcementRoutes from "./modules/announcements/announcement.routes.js";
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

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(apiLimiter);



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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/announcements", announcementRoutes);
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

// Unhandled routes & errors
app.use(notFound);
app.use(errorHandler);

export default app;
