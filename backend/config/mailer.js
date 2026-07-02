import nodemailer from "nodemailer";

const getSmtpPort = () => Number(process.env.SMTP_PORT || 587);

export const createTransporter = () => {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error("SMTP and email credentials must be set before sending email");
    }

    return nodemailer.createTransport({
        host,
        port: getSmtpPort(),
        secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
        auth: {
            user,
            pass
        }
    });
};

export const getFromAddress = () => process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;

export const getAdminEmail = () => process.env.ADMIN_EMAIL || process.env.RECEIVER_EMAIL || process.env.SUPPORT_EMAIL;