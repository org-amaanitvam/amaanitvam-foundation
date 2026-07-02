import express from "express";
import galleryRoutes from "./routes/galleryRoutes.js";
const app = express();
app.use("/api/gallery", galleryRoutes);
app.listen(5002, () => console.log("running"));
