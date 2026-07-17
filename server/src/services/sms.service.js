import logger from "../shared/logger/index.js";

export const sendSms = async ({ to, message }) => {
  try {
    // SMS provider integration (e.g., Twilio, MSG91)
    // Replace with actual SMS provider SDK call
    logger.info(`SMS sent to ${to}: ${message}`);
    return { success: true, to };
  } catch (error) {
    logger.error(`Error sending SMS to ${to}: ${error.message}`);
    throw error;
  }
};
