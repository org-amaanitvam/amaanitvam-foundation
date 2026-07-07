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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://amaanitvam.org",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "100mb" }));
app.use("/api/profile", profileRoutes);
app.use("/api/webhook", express.raw({ type: "application/json" }), webhookRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Standard Routing
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
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

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 5000, () => console.log("Server running"));
  } catch (err) {
    process.exit(1);
  }
};
startServer();