  import "dotenv/config";
import { connectDB } from "./config/database.js";
import { validateEnv } from "./config/env.js";
import logger from "./shared/logger/index.js";
import app from "./app.js";

const startServer = async () => {
  try {
    // Validate required env vars
    validateEnv();

    // Connect to MongoDB
    await connectDB();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // In production, you might want to gracefully shutdown:
  // server.close(() => process.exit(1));
});
