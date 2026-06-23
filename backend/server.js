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


dotenv.config();

connectDB();

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1); // Fixes the permissive trust proxy error

// 1. Security Headers
app.use(helmet());

// 2. CORS Enforcement
const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://amaanitvam.org",
    "https://www.amaanitvam.org",
    "https://admin.amaanitvam.org"
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// 3. Rate Limiting (Spam Protection)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per windowMs
    message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});
// app.use("/api/", apiLimiter);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/contact", contactRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/donate", donationRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.get("/health", (req, res) => {
    res.json({ success: true, message: "OK" });
});

// 4. Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Global Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "An unexpected error occurred on the server."
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
