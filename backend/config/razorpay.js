import Razorpay from "razorpay";

let razorpayInstance = null;

export const getRazorpayInstance = () => {
    if (!razorpayInstance) {
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) must be set in .env");
        }

        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });
    }

    return razorpayInstance;
};

export const getRazorpayKeyId = () => process.env.RAZORPAY_KEY_ID;
