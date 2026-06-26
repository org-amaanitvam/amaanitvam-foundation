
    import express from "express";
    import cors from "cors";
    import dotenv from "dotenv";
    import helmet from "helmet";
    import rateLimit from "express-rate-limit";
    
    import connectDB from "./config/db.js";
    import contactRoutes from "./routes/contactRoutes.js";
    import internshipRoutes from "./routes/internshipRoutes.js";
    import volunteerRoutes from "./routes/volunteerRoutes.js";
    import webhookRoutes from "./routes/webhookRoutes.js";
    import donationRoutes from "./routes/donationRoutes.js";
    import adminRoutes from "./routes/adminRoutes.js";
    import certificateRoutes from "./routes/certificateRoutes.js";
    import galleryRoutes from "./routes/galleryRoutes.js";
    import meetingRoutes from "./routes/meetingRoutes.js";
    import taskRoutes from "./routes/TasksRoutes.js";
    import announcementRoutes from "./routes/announcementRoutes.js";
    import projectRoutes from "./routes/projectRoutes.js";
    import notificationRoutes from "./routes/notificationRoutes.js";
    import publicRoutes from "./routes/publicRoutes.js";
    import cmsRoutes from "./routes/cmsRoutes.js";
    import User from "./models/user.js";
    import path from "path";
    import { fileURLToPath } from "url";
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    dotenv.config();
    connectDB();
    
    const app = express();
    
    app.disable("x-powered-by");
    app.set("trust proxy", 1); 
    app.use(helmet({ crossOriginResourcePolicy: false }));
    
    const allowedOrigins = [
        "http://127.0.0.1:5500", "http://localhost:5500",
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "https://amaanitvam.org", "https://www.amaanitvam.org",
        "https://admin.amaanitvam.org"
    ];
    app.use(cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) callback(null, true);
            else callback(new Error("Not allowed by CORS"));
        },
        credentials: true
    }));
    
    app.use(express.json({ limit: "100kb" }));
    app.use(express.urlencoded({ extended: true }));
    
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));
    
    app.use("/api/contact", contactRoutes);
    app.use("/api/internship", internshipRoutes);
    app.use("/api/volunteer", volunteerRoutes);
    app.use("/api/webhook", webhookRoutes);
    app.use("/api/donate", donationRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/certificates", certificateRoutes);
    app.use("/api/gallery", galleryRoutes);
    app.use("/api/meetings", meetingRoutes);
    app.use("/api/tasks", taskRoutes);
    app.use("/api/announcements", announcementRoutes);
    app.use("/api/projects", projectRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/public", publicRoutes);
    app.use("/api/cms", cmsRoutes);
    
    app.get("/", (req, res) => res.send("Backend Running"));
    app.get("/health", (req, res) => res.json({ success: true, message: "OK" }));
    
    app.use((err, req, res, next) => {
        res.status(err.status || 500).json({ success: false, message: err.message });
    });
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    
