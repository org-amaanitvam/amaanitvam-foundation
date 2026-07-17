import logger from "../shared/logger/index.js";

export const logActivity = async ({ userId, action, entity, entityId, details = {} }) => {
  try {
    logger.info(`Activity: ${action} on ${entity}:${entityId} by user ${userId}`, details);
    return { success: true };
  } catch (error) {
    logger.error(`Error logging activity: ${error.message}`);
    throw error;
  }
};
