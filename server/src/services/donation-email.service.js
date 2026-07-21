import { smtpConfig, transporter } from "../config/mailer.js";

const pickEnv = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && String(value).trim()) return String(value).trim();
  }
  return "";
};

const htmlEscape = (value = "") =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const money = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const mailIdentity = () => {
  const fromEmail =
    pickEnv("SMTP_FROM_EMAIL", "MAIL_FROM", "EMAIL_FROM") ||
    smtpConfig.user ||
    "amaanitvamfoundation@gmail.com";
  const fromName =
    pickEnv("SMTP_FROM_NAME", "MAIL_FROM_NAME", "EMAIL_FROM_NAME") ||
    "Amaanitvam Foundation";
  const adminEmail =
    pickEnv(
      "DONATION_ADMIN_EMAIL",
      "ADMIN_EMAIL",
      "MAIL_TO",
      "EMAIL_TO",
      "CONTACT_RECEIVER_EMAIL",
    ) || smtpConfig.user;

  return {
    from: `${fromName} <${fromEmail}>`,
    adminEmail,
  };
};

const emailDisabled = () =>
  ["1", "true", "yes", "on"].includes(
    String(process.env.EMAIL_DISABLED || process.env.SMTP_DISABLED || "").toLowerCase(),
  );

const donationDestination = (donation) =>
  donation.donationType === "campaign"
    ? donation.campaignTitleSnapshot || "Fundraising Campaign"
    : "Amaanitvam Foundation";

export const sendDonationReceiptEmail = async ({ donation } = {}) => {
  if (emailDisabled()) {
    return { success: false, skipped: true, reason: "email_disabled" };
  }

  const donorEmail = String(donation?.email || "").trim();
  if (!donorEmail) {
    return { success: false, skipped: true, reason: "missing_donor_email" };
  }
  if (!smtpConfig.user || !smtpConfig.pass) {
    console.error(
      "[email] Donation email skipped: SMTP credentials are missing. " +
      "Check SMTP_USER and SMTP_PASS in Render environment variables."
    );
    return {
      success: false,
      skipped: true,
      reason: "missing_smtp_credentials"
    };
  }

  const { from, adminEmail } = mailIdentity();
  const destination = donationDestination(donation);
  const subject = `Thank You for Your Donation of ₹${money(donation.amount)} - Amaanitvam Foundation`;

  try {
    const info = await transporter.sendMail({
      from,
      to: donorEmail,
      replyTo: adminEmail || undefined,
      subject,
      text: [
        `Dear ${donation.name || "Donor"},`,
        "",
        "Your donation has been received successfully.",
        `Amount: ₹${money(donation.amount)}`,
        `Donated To: ${destination}`,
        `Transaction ID: ${donation.razorpayPaymentId || "N/A"}`,
        `Order ID: ${donation.razorpayOrderId || "N/A"}`,
        "",
        "Thank you for supporting Amaanitvam Foundation.",
        "Amaanitvam Foundation",
        "https://www.amaanitvam.org",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;line-height:1.6;color:#222">
          <h2 style="color:#7a1238">Thank You for Your Donation</h2>
          <p>Dear ${htmlEscape(donation.name || "Donor")},</p>
          <p>Your donation has been received successfully. Thank you for supporting Amaanitvam Foundation.</p>
          <table style="border-collapse:collapse;width:100%">
            <tr><td><strong>Amount</strong></td><td>₹${money(donation.amount)}</td></tr>
            <tr><td><strong>Donated To</strong></td><td>${htmlEscape(destination)}</td></tr>
            <tr><td><strong>Transaction ID</strong></td><td>${htmlEscape(donation.razorpayPaymentId || "N/A")}</td></tr>
            <tr><td><strong>Order ID</strong></td><td>${htmlEscape(donation.razorpayOrderId || "N/A")}</td></tr>
          </table>
          <p>Regards,<br><strong>Amaanitvam Foundation</strong></p>
        </div>`,
    });

    console.log(`[email] Donation receipt sent to ${donorEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[email] Donation receipt failed for ${donorEmail}:`, error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
};

export const sendDonationAdminEmail = async ({ donation } = {}) => {
  if (emailDisabled()) {
    return { success: false, skipped: true, reason: "email_disabled" };
  }
  if (!smtpConfig.user || !smtpConfig.pass) {
    console.error(
      "[email] Donation email skipped: SMTP credentials are missing. " +
      "Check SMTP_USER and SMTP_PASS in Render environment variables."
    );
    return {
      success: false,
      skipped: true,
      reason: "missing_smtp_credentials"
    };
  }

  const { from, adminEmail } = mailIdentity();
  if (!adminEmail) {
    return { success: false, skipped: true, reason: "missing_admin_email" };
  }

  const destination = donationDestination(donation);

  try {
    const info = await transporter.sendMail({
      from,
      to: adminEmail,
      replyTo: donation?.email || undefined,
      subject: `New Donation Received - ₹${money(donation?.amount)}`,
      text: [
        "New donation received",
        `Name: ${donation?.name || "N/A"}`,
        `Email: ${donation?.email || "N/A"}`,
        `Phone: ${donation?.phone || "N/A"}`,
        `Amount: ₹${money(donation?.amount)}`,
        `Donated To: ${destination}`,
        `Transaction ID: ${donation?.razorpayPaymentId || "N/A"}`,
        `Order ID: ${donation?.razorpayOrderId || "N/A"}`,
      ].join("\n"),
    });

    console.log(`[email] Donation admin notification sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[email] Donation admin notification failed:", error?.message || error);
    return { success: false, error: error?.message || String(error) };
  }
};
