import nodemailer from "nodemailer";

const pickEnv = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && String(value).trim()) return String(value).trim();
  }
  return "";
};

const port = Number(pickEnv("SMTP_PORT", "EMAIL_PORT", "MAIL_PORT") || 587);
const secureRaw = pickEnv("SMTP_SECURE", "EMAIL_SECURE", "MAIL_SECURE");
const secure = secureRaw
  ? ["1", "true", "yes", "on"].includes(secureRaw.toLowerCase())
  : port === 465;

const user = pickEnv(
  "SMTP_USER",
  "SMTP_EMAIL",
  "EMAIL_USER",
  "EMAIL_USERNAME",
  "MAIL_USER",
  "GMAIL_USER",
);

const pass = pickEnv(
  "SMTP_PASS",
  "SMTP_PASSWORD",
  "EMAIL_PASS",
  "EMAIL_PASSWORD",
  "MAIL_PASS",
  "MAIL_PASSWORD",
  "GMAIL_APP_PASSWORD",
);

export const smtpConfig = {
  host: pickEnv("SMTP_HOST", "EMAIL_HOST", "MAIL_HOST") || "smtp.gmail.com",
  port,
  secure,
  user,
  pass,
};

export const transporter = nodemailer.createTransport({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,

  auth:
    smtpConfig.user && smtpConfig.pass
      ? {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        }
      : undefined,

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  dnsTimeout: 10000,
});
