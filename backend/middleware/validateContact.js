const trimValue = (value) => String(value ?? "").replace(/\u0000/g, "").trim();

const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

export const validateContactSubmission = (req, res, next) => {
    const name = trimValue(req.body?.name);
    const email = trimValue(req.body?.email).toLowerCase();
    const subject = trimValue(req.body?.subject);
    const message = trimValue(req.body?.message);

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "Failed to send message."
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Failed to send message."
        });
    }

    req.validatedContact = {
        name,
        email,
        subject,
        message
    };

    req.clientIp =
        String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        "Unknown";

    next();
};