import nodemailer from "nodemailer";
import dns from "node:dns/promises";
import net from "node:net";

const pickEnv = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
};

const port = Number(
  pickEnv("SMTP_PORT", "EMAIL_PORT", "MAIL_PORT") || 587,
);

const secureRaw = pickEnv(
  "SMTP_SECURE",
  "EMAIL_SECURE",
  "MAIL_SECURE",
);

const secure = secureRaw
  ? ["1", "true", "yes", "on"].includes(
      secureRaw.toLowerCase(),
    )
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

const originalHost =
  pickEnv(
    "SMTP_HOST",
    "EMAIL_HOST",
    "MAIL_HOST",
  ) || "smtp.gmail.com";

/*
 * Render SMTP IPv6 fix
 *
 * Render was attempting Gmail using an IPv6 address:
 *   2607:f8b0:...
 *
 * and failing with:
 *   ENETUNREACH
 *
 * Resolve an IPv4 address explicitly and give that IP to
 * Nodemailer. Keep the original hostname as tls.servername
 * so TLS certificate validation still works correctly.
 */
let connectionHost = originalHost;

if (!net.isIP(originalHost)) {
  try {
    const ipv4Addresses = await dns.resolve4(originalHost);

    if (ipv4Addresses.length > 0) {
      connectionHost = ipv4Addresses[0];

      console.log(
        `[email] SMTP IPv4 forced: ${originalHost} -> ${connectionHost}`,
      );
    } else {
      console.warn(
        `[email] No IPv4 address found for ${originalHost}; using hostname.`,
      );
    }
  } catch (error) {
    console.warn(
      `[email] IPv4 resolution failed for ${originalHost}:`,
      error?.message || error,
    );
  }
}

export const smtpConfig = {
  host: originalHost,
  connectionHost,
  port,
  secure,
  user,
  pass,
};

export const transporter = nodemailer.createTransport({
  // IMPORTANT: connect directly to IPv4 address
  host: connectionHost,

  port: smtpConfig.port,
  secure: smtpConfig.secure,

  auth:
    smtpConfig.user && smtpConfig.pass
      ? {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        }
      : undefined,

  /*
   * Required because we connect using an IP address.
   * TLS must still validate smtp.gmail.com.
   */
  tls: {
    servername: originalHost,
    minVersion: "TLSv1.2",
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,
});
