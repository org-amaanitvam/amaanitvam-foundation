import { Resend } from "resend";

const WEBSITE_URL = "https://www.amaanitvam.org";
const ADMIN_URL = "https://admin.amaanitvam.org";

const pickEnv = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && String(value).trim()) {
      return String(value).trim();
    }
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

const formatDonationDate = (donation) => {
  const rawDate =
    donation?.paidAt ||
    donation?.updatedAt ||
    donation?.createdAt ||
    new Date();

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

const emailDisabled = () =>
  ["1", "true", "yes", "on"].includes(
    String(process.env.EMAIL_DISABLED || "").toLowerCase(),
  );

const resendConfig = () => {
  const apiKey = pickEnv("RESEND_API_KEY");

  const fromEmail =
    pickEnv("RESEND_FROM_EMAIL") ||
    "donations@amaanitvam.org";

  const fromName =
    pickEnv("RESEND_FROM_NAME") ||
    "Amaanitvam Foundation";

  const adminEmail = pickEnv(
    "DONATION_ADMIN_EMAIL",
    "ADMIN_EMAIL",
    "CONTACT_RECEIVER_EMAIL",
  );

  const replyTo =
    pickEnv("RESEND_REPLY_TO") ||
    adminEmail;

  return {
    apiKey,
    from: `${fromName} <${fromEmail}>`,
    adminEmail,
    replyTo,
  };
};

const donationDestination = (donation) =>
  donation?.donationType === "campaign"
    ? donation?.campaignTitleSnapshot || "Fundraising Campaign"
    : "Amaanitvam Foundation";

const sendWithResend = async ({
  to,
  subject,
  text,
  html,
  replyTo,
}) => {
  const { apiKey, from } = resendConfig();

  if (!apiKey) {
    return {
      success: false,
      skipped: true,
      reason: "missing_resend_api_key",
    };
  }

  const resend = new Resend(apiKey);

  const payload = {
    from,
    to,
    subject,
    text,
    html,
  };

  if (replyTo) {
    payload.replyTo = replyTo;
  }

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    return {
      success: false,
      error:
        error?.message ||
        error?.name ||
        JSON.stringify(error),
    };
  }

  if (!data?.id) {
    return {
      success: false,
      error: "Resend returned no email id",
    };
  }

  return {
    success: true,
    messageId: data.id,
  };
};

const infoRow = (label, value, { highlight = false, last = false } = {}) => `
  <tr>
    <td
      style="
        padding:12px 0;
        font-size:13px;
        line-height:1.5;
        color:#6b5b55;
        ${last ? "" : "border-bottom:1px solid #ead8c7;"}
      "
    >
      ${htmlEscape(label)}
    </td>
    <td
      align="right"
      style="
        padding:12px 0 12px 18px;
        font-size:${highlight ? "22px" : "13px"};
        line-height:1.5;
        font-weight:${highlight ? "700" : "600"};
        color:${highlight ? "#5d0f2d" : "#3d2b2b"};
        word-break:break-word;
        ${last ? "" : "border-bottom:1px solid #ead8c7;"}
      "
    >
      ${htmlEscape(value)}
    </td>
  </tr>
`;

const buildDonorEmailHtml = (donation) => {
  const donorName = htmlEscape(donation?.name || "Donor");
  const destination = donationDestination(donation);
  const amount = `₹${money(donation?.amount)}`;
  const paymentId = donation?.razorpayPaymentId || "N/A";
  const orderId = donation?.razorpayOrderId || "N/A";
  const date = formatDonationDate(donation);

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @media only screen and (max-width:620px) {
      .email-shell { width:100% !important; }
      .email-padding { padding-left:20px !important; padding-right:20px !important; }
      .impact-col { display:block !important; width:100% !important; padding:10px 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5efe6;font-family:Arial,Helvetica,sans-serif;color:#3d2b2b;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Your donation of ${htmlEscape(amount)} has been received successfully.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5efe6;">
    <tr>
      <td align="center" style="padding:36px 14px;">
        <table
          role="presentation"
          width="620"
          cellspacing="0"
          cellpadding="0"
          border="0"
          class="email-shell"
          style="
            width:620px;
            max-width:620px;
            background:#fffaf3;
            border:1px solid #dcc8b6;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 12px 35px rgba(93,15,45,.10);
          "
        >
          <tr>
            <td style="height:6px;background:#d8a15f;font-size:0;">&nbsp;</td>
          </tr>

          <tr>
            <td align="center" class="email-padding" style="padding:34px 34px 30px;background:#5d0f2d;">
              <div style="font-size:11px;letter-spacing:2.4px;text-transform:uppercase;font-weight:700;color:#d8a15f;">
                Amaanitvam Foundation
              </div>
              <div style="margin-top:12px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.18;font-weight:600;color:#ffffff;">
                Thank You for Making a Difference
              </div>
              <div style="width:54px;height:2px;margin:18px auto 0;background:#c46b87;">&nbsp;</div>
              <div style="margin-top:16px;font-size:14px;line-height:1.7;color:#f3dde4;">
                Your generosity helps us strengthen education, compassion and community action.
              </div>
            </td>
          </tr>

          <tr>
            <td class="email-padding" style="padding:34px 40px 40px;">
              <div align="center" style="margin-bottom:26px;">
                <span
                  style="
                    display:inline-block;
                    padding:9px 17px;
                    border-radius:999px;
                    background:#fff1f4;
                    border:1px solid #e4b8c6;
                    color:#5d0f2d;
                    font-size:12px;
                    font-weight:700;
                  "
                >
                  ✓ PAYMENT SUCCESSFUL
                </span>
              </div>

              <p style="margin:0 0 14px;font-size:17px;line-height:1.6;color:#3d2b2b;">
                Dear <strong>${donorName}</strong>,
              </p>

              <p style="margin:0;font-size:14px;line-height:1.8;color:#6b5b55;">
                Thank you for standing with Amaanitvam Foundation. Your donation has been received successfully.
                Every contribution helps us create meaningful opportunities and long-term community impact.
              </p>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top:29px;
                  background:#ffffff;
                  border:1px solid #dcc8b6;
                  border-radius:14px;
                "
              >
                <tr>
                  <td style="padding:23px 25px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:1.7px;color:#c46b87;text-transform:uppercase;">
                      Donation Receipt
                    </div>
                    <div style="margin-top:5px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;color:#5d0f2d;">
                      Contribution Details
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:10px;">
                      ${infoRow("Amount Donated", amount, { highlight: true })}
                      ${infoRow("Donated To", destination)}
                      ${infoRow("Transaction ID", paymentId)}
                      ${infoRow("Order ID", orderId)}
                      ${infoRow("Date", date, { last: true })}
                    </table>
                  </td>
                </tr>
              </table>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top:20px;
                  background:#f8f3ed;
                  border-left:4px solid #d8a15f;
                  border-radius:8px;
                "
              >
                <tr>
                  <td style="padding:17px 19px;">
                    <div style="font-size:13px;font-weight:700;color:#5d0f2d;">
                      Keep this confirmation for your records
                    </div>
                    <div style="margin-top:6px;font-size:12px;line-height:1.65;color:#6b5b55;">
                      For donation-related documentation or questions, simply reply to this email and our team will assist you.
                    </div>
                  </td>
                </tr>
              </table>

              <div align="center" style="margin-top:31px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:600;color:#5d0f2d;">
                  Together, We Create Impact
                </div>
                <div style="margin-top:7px;font-size:13px;line-height:1.6;color:#6b5b55;">
                  Your contribution strengthens our ability to serve communities.
                </div>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:20px;">
                <tr>
                  <td width="33%" align="center" class="impact-col" style="padding:9px 7px;">
                    <div style="font-size:28px;">📚</div>
                    <div style="margin-top:8px;font-size:12px;font-weight:700;color:#5d0f2d;">Education</div>
                  </td>
                  <td width="33%" align="center" class="impact-col" style="padding:9px 7px;">
                    <div style="font-size:28px;">🤝</div>
                    <div style="margin-top:8px;font-size:12px;font-weight:700;color:#5d0f2d;">Community</div>
                  </td>
                  <td width="33%" align="center" class="impact-col" style="padding:9px 7px;">
                    <div style="font-size:28px;">🌱</div>
                    <div style="margin-top:8px;font-size:12px;font-weight:700;color:#5d0f2d;">Empowerment</div>
                  </td>
                </tr>
              </table>

              <div align="center" style="padding-top:29px;">
                <a
                  href="${WEBSITE_URL}"
                  style="
                    display:inline-block;
                    padding:14px 27px;
                    background:#d8a15f;
                    color:#5d0f2d;
                    border-radius:8px;
                    font-size:13px;
                    font-weight:700;
                    text-decoration:none;
                  "
                >
                  Explore Our Impact →
                </a>
              </div>

              <div
                align="center"
                style="
                  margin-top:27px;
                  padding-top:23px;
                  border-top:1px solid #ead8c7;
                  font-size:13px;
                  line-height:1.7;
                  color:#6b5b55;
                "
              >
                With gratitude,<br>
                <strong style="color:#5d0f2d;">Amaanitvam Foundation</strong>
              </div>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              class="email-padding"
              style="
                padding:26px 30px;
                background:#4a0b23;
                border-top:4px solid #d8a15f;
              "
            >
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;color:#ffffff;">
                Amaanitvam Foundation
              </div>
              <div style="margin-top:7px;font-size:12px;color:#e8cbd5;">
                Education • Compassion • Community Action
              </div>
              <div style="margin-top:14px;">
                <a href="${WEBSITE_URL}" style="color:#d8a15f;font-size:12px;font-weight:700;text-decoration:none;">
                  www.amaanitvam.org
                </a>
              </div>
              <div
                style="
                  margin-top:17px;
                  padding-top:15px;
                  border-top:1px solid rgba(255,255,255,.14);
                  font-size:10px;
                  line-height:1.6;
                  color:#cfaebb;
                "
              >
                This is an automated donation confirmation. You can reply directly to this email for assistance.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

const buildAdminEmailHtml = (donation) => {
  const amount = `₹${money(donation?.amount)}`;
  const destination = donationDestination(donation);
  const donorName = donation?.name || "N/A";
  const donorEmail = donation?.email || "N/A";
  const donorPhone = donation?.phone || "N/A";
  const paymentId = donation?.razorpayPaymentId || "N/A";
  const orderId = donation?.razorpayOrderId || "N/A";
  const date = formatDonationDate(donation);

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5efe6;font-family:Arial,Helvetica,sans-serif;color:#3d2b2b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:34px 14px;">
        <table
          role="presentation"
          width="600"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width:600px;
            width:100%;
            background:#fffaf3;
            border:1px solid #dcc8b6;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 12px 35px rgba(93,15,45,.10);
          "
        >
          <tr>
            <td style="height:5px;background:#d8a15f;font-size:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding:29px 32px;background:#5d0f2d;color:#ffffff;">
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:#d8a15f;text-transform:uppercase;">
                Amaanitvam Foundation
              </div>
              <div style="margin-top:9px;font-family:Georgia,'Times New Roman',serif;font-size:29px;font-weight:600;">
                New Donation Received
              </div>
              <div style="margin-top:7px;font-size:13px;line-height:1.6;color:#ead3dc;">
                A successful contribution has been recorded in the donation system.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 32px 34px;">
              <div
                style="
                  padding:24px;
                  text-align:center;
                  background:#f8f3ed;
                  border:1px solid #dcc8b6;
                  border-radius:12px;
                "
              >
                <div style="font-size:11px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#6b5b55;">
                  Amount Received
                </div>
                <div style="margin-top:7px;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:700;color:#5d0f2d;">
                  ${htmlEscape(amount)}
                </div>
                <div style="margin-top:7px;font-size:12px;color:#6b5b55;">
                  ${htmlEscape(destination)}
                </div>
              </div>

              <div style="margin-top:28px;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:600;color:#5d0f2d;">
                Donor Information
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:10px;">
                ${infoRow("Name", donorName)}
                ${infoRow("Email", donorEmail)}
                ${infoRow("Phone", donorPhone, { last: true })}
              </table>

              <div style="margin-top:28px;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:600;color:#5d0f2d;">
                Payment Information
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:10px;">
                ${infoRow("Donated To", destination)}
                ${infoRow("Transaction ID", paymentId)}
                ${infoRow("Order ID", orderId)}
                ${infoRow("Date", date, { last: true })}
              </table>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top:22px;
                  background:#f8f3ed;
                  border-left:4px solid #d8a15f;
                  border-radius:8px;
                "
              >
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-size:13px;font-weight:700;color:#5d0f2d;">
                      Quick action
                    </div>
                    <div style="margin-top:5px;font-size:12px;line-height:1.6;color:#6b5b55;">
                      Review this donation in the admin portal. Replying to this email replies directly to the donor when their email address is available.
                    </div>
                  </td>
                </tr>
              </table>

              <div align="center" style="margin-top:28px;">
                <a
                  href="${ADMIN_URL}"
                  style="
                    display:inline-block;
                    padding:13px 24px;
                    background:#5d0f2d;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:7px;
                    font-size:13px;
                    font-weight:700;
                  "
                >
                  Open Admin Portal →
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="
                padding:21px;
                background:#4a0b23;
                border-top:4px solid #d8a15f;
              "
            >
              <div style="font-size:12px;font-weight:700;color:#ffffff;">
                Amaanitvam Foundation
              </div>
              <div style="margin-top:5px;font-size:10px;color:#cfaebb;">
                Internal Donation Notification
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export const sendDonationReceiptEmail = async ({ donation } = {}) => {
  if (emailDisabled()) {
    return {
      success: false,
      skipped: true,
      reason: "email_disabled",
    };
  }

  const donorEmail = String(donation?.email || "").trim();

  if (!donorEmail) {
    return {
      success: false,
      skipped: true,
      reason: "missing_donor_email",
    };
  }

  const { replyTo } = resendConfig();
  const destination = donationDestination(donation);

  try {
    const result = await sendWithResend({
      to: donorEmail,
      replyTo: replyTo || undefined,
      subject:
        `Thank You for Your Donation of ₹${money(donation?.amount)} - Amaanitvam Foundation`,
      text: [
        `Dear ${donation?.name || "Donor"},`,
        "",
        "Your donation has been received successfully.",
        `Amount: ₹${money(donation?.amount)}`,
        `Donated To: ${destination}`,
        `Transaction ID: ${donation?.razorpayPaymentId || "N/A"}`,
        `Order ID: ${donation?.razorpayOrderId || "N/A"}`,
        "",
        "Thank you for supporting Amaanitvam Foundation.",
        WEBSITE_URL,
      ].join("\n"),
      html: buildDonorEmailHtml(donation),
    });

    if (result.success) {
      console.log(
        `[email][resend] Donation receipt sent to ${donorEmail}: ${result.messageId}`,
      );
    } else {
      console.error(
        `[email][resend] Donation receipt failed for ${donorEmail}:`,
        result.error || result.reason,
      );
    }

    return result;
  } catch (error) {
    console.error(
      `[email][resend] Donation receipt failed for ${donorEmail}:`,
      error?.message || error,
    );

    return {
      success: false,
      error: error?.message || String(error),
    };
  }
};

export const sendDonationAdminEmail = async ({ donation } = {}) => {
  if (emailDisabled()) {
    return {
      success: false,
      skipped: true,
      reason: "email_disabled",
    };
  }

  const { adminEmail } = resendConfig();

  if (!adminEmail) {
    return {
      success: false,
      skipped: true,
      reason: "missing_admin_email",
    };
  }

  const donorEmail = String(donation?.email || "").trim();
  const destination = donationDestination(donation);

  try {
    const result = await sendWithResend({
      to: adminEmail,
      replyTo: donorEmail || undefined,
      subject:
        `New Donation Received - ₹${money(donation?.amount)}`,
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
      html: buildAdminEmailHtml(donation),
    });

    if (result.success) {
      console.log(
        `[email][resend] Donation admin notification sent: ${result.messageId}`,
      );
    } else {
      console.error(
        "[email][resend] Donation admin notification failed:",
        result.error || result.reason,
      );
    }

    return result;
  } catch (error) {
    console.error(
      "[email][resend] Donation admin notification failed:",
      error?.message || error,
    );

    return {
      success: false,
      error: error?.message || String(error),
    };
  }
};
