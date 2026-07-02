import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/user.js";

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: "tech.amaanitvam@gmail.com" });
        if (user) {
            console.log("User found:", user.email, "Role:", user.role, "Status:", user.status);
        } else {
            console.log("User not found in DB!");
        }
        process.exit(0);
    } catch (e) {
        console.error("DB error:", e.message);
        process.exit(1);
    }
}
check();