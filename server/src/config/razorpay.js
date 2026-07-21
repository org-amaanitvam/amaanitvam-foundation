import Razorpay from "razorpay";

let razorpayInstance = null;
let cachedKeyId = "";
let cachedKeySecret = "";

export const getRazorpayKeyId = () =>
  String(process.env.RAZORPAY_KEY_ID || "").trim();

export const getRazorpayInstance = () => {
  const keyId = getRazorpayKeyId();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the backend service.",
    );
  }

  if (
    !razorpayInstance ||
    cachedKeyId !== keyId ||
    cachedKeySecret !== keySecret
  ) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    cachedKeyId = keyId;
    cachedKeySecret = keySecret;
  }

  return razorpayInstance;
};

// Preserve the old default-export contract for any existing module that imports
// the configured Razorpay instance directly.
try {
  razorpayInstance = getRazorpayInstance();
} catch (error) {
  console.warn(`Razorpay initialization skipped: ${error.message}`);
}

export default razorpayInstance;
