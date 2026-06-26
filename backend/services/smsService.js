export const sendSMSNotification = async (phone, message) => {
    try {
        console.log(`[SMS MOCK] Sending SMS to ${phone}:`);
        console.log(`Message: ${message}`);
        console.log('-----------------------------------');
        return true;
    } catch (error) {
        console.error('Failed to send SMS:', error);
        return false;
    }
};
