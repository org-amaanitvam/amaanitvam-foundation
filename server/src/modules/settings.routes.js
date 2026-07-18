import express from "express";

const router = express.Router();

// Dummy route to satisfy the frontend public settings request
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      siteName: "Amaanitvam Foundation",
      maintenanceMode: false
    }
  });
});

export default router;