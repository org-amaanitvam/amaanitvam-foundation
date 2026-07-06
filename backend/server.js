import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import profileRoutes from "./routes/profileRoutes.js";

import connectDB from "./config/db.js";

import contactRoutes from "./routes/contactRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import taskRoutes from "./routes/TasksRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import cmsRoutes from "./routes/cmsRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import galleryMongoMediaFixRoutes from "./routes/galleryMongoMediaFixRoutes.js";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://amaanitvam.org",
  "https://www.amaanitvam.org",
  "https://admin.amaanitvam.org",
  "https://amaanitvam-foundation-five.vercel.app",
  "https://amaanitvam-admin.onrender.com",
  "https://amaanitvam-dashboard.onrender.com",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked:", origin);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use("/api/profile", profileRoutes);
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Amaanitvam Foundation API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy",
  });
});

app.use("/api/contact", contactRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/donate", donationRoutes);
app.use("/api/campaigns", campaignRoutes);

app.use("/api", galleryMongoMediaFixRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/reports", (req, res) => {
  res.json({
    success: true,
    reports: [
      {
        _id: "report-1",
        title: "June Performance Summary",
        description:
          "Overall excellent progress in frontend development, backend task completions, and team collaboration.",
        createdAt: new Date("2026-06-30T10:00:00.000Z"),
      },
      {
        _id: "report-2",
        title: "Mid-Term Internship Report",
        description:
          "Good understanding of system architecture, clean documentation writing, and prompt response to bug fixes.",
        createdAt: new Date("2026-06-15T10:00:00.000Z"),
      },
    ],
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();