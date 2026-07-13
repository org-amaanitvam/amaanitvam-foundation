import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// Route Imports
import profileRoutes from "./routes/profileRoutes.js";
import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
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
import internshipRoutes from "./routes/internshipRoutes.js";
import learningHubRoutes from "./routes/learningHubRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://amaanitvam.org",
  "https://www.amaanitvam.org",
  "https://admin.amaanitvam.org",
  "https://dashboard.amaanitvam.org",
  "https://amaanitvam-foundation-five.vercel.app",

  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.DASHBOARD_URL,
].filter(Boolean);

// CORS Configuration
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

// Parsers (Raw for Webhooks, JSON/URLEncoded for everything else)
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRoutes);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Static Uploads Directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", (req, res) => res.status(404).send("File no longer exists on this server."));

// Standard API Routing
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/donate", donationRoutes);
app.use("/api/campaigns", campaignRoutes);
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
app.use("/api/internship", internshipRoutes);
app.use("/api/learning-hub", learningHubRoutes);
app.use("/api", galleryMongoMediaFixRoutes);

// Serve Frontend Static Files (Dashboard)
const dashboardBuildPath = path.join(__dirname, "../frontend/Portals/dashboard/dist");
app.use(express.static(dashboardBuildPath));

// CATCH-ALL: Redirect non-API requests to the React app
app.get(/(.*)/, (req, res, next) => {
  // Ignore both API and Uploads requests, send them straight to 404
  if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/uploads")) {
    return next();
  }
  res.sendFile(path.join(dashboardBuildPath, "index.html"));
});
// 404 API Handler
// Global Error Handler (Prevents HTML crashes!)
app.use((err, req, res, next) => {
  console.error("🔥 MIDDLEWARE CRASH REPORT:");
  console.error(err); // This will reveal what [object Object] actually is
  res.status(500).json({ 
    success: false, 
    message: "A middleware error occurred", 
    errorDetails: err.message 
  });
});

// Start Database and Server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
