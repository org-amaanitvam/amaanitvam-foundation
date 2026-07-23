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

const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();

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

  const { data, error } =
    await resend.emails.send(payload);

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

const receiptRow = (label, value, highlight = false) => `
  <tr>
    <td
      style="
        padding:12px 0;
        font-size:14px;
        color:#a8a8ad;
        vertical-align:top;
        border-bottom:1px solid #343438;
      "
    >
      ${htmlEscape(label)}
    </td>

    <td
      align="right"
      style="
        padding:12px 0;
        font-size:${highlight ? "23px" : "14px"};
        line-height:1.4;
        font-weight:${highlight ? "700" : "500"};
        color:${highlight ? "#eb647c" : "#f3f3f5"};
        vertical-align:top;
        border-bottom:1px solid #343438;
        word-break:break-word;
      "
    >
      ${htmlEscape(value)}
    </td>
  </tr>
`;

const buildDonorEmailHtml = (donation) => {
  const donorName =
    htmlEscape(donation?.name || "Donor");

  const destination =
    donationDestination(donation);

  const amount =
    `₹${money(donation?.amount)}`;

  const transactionId =
    donation?.razorpayPaymentId || "N/A";

  const orderId =
    donation?.razorpayOrderId || "N/A";

  const donationDate =
    formatDate(
      donation?.paidAt ||
      donation?.updatedAt ||
      donation?.createdAt,
    );

  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">

  <style>
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
      }

      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }

      .impact-cell {
        display: block !important;
        width: 100% !important;
        padding: 12px 0 !important;
      }
    }
  </style>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#171820;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
    "
  >
    Your donation of ${amount} was received successfully.
  </div>

  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background:#171820;"
  >
    <tr>
      <td
        align="center"
        style="padding:32px 12px;"
      >
        <table
          role="presentation"
          width="600"
          cellspacing="0"
          cellpadding="0"
          border="0"
          class="email-container"
          style="
            width:600px;
            max-width:600px;
            background:#101011;
            border:1px solid #29292d;
            border-radius:18px;
            overflow:hidden;
          "
        >

          <!-- HEADER -->
          <tr>
            <td
              align="center"
              style="
                padding:32px 24px;
                background:#e85f78;
              "
            >
              <div
                style="
                  font-size:29px;
                  line-height:1.25;
                  font-weight:700;
                  color:#ffffff;
                "
              >
                🙏 Thank You for Your Generosity!
              </div>

              <div
                style="
                  padding-top:7px;
                  font-size:15px;
                  color:#fff3f5;
                "
              >
                Amaanitvam Foundation
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td
              class="mobile-padding"
              style="
                padding:30px 36px 36px;
                color:#e8e8ea;
              "
            >

              <div
                align="center"
                style="margin-bottom:26px;"
              >
                <span
                  style="
                    display:inline-block;
                    padding:9px 20px;
                    background:#19bf7a;
                    color:#ffffff;
                    border-radius:999px;
                    font-size:14px;
                    font-weight:700;
                  "
                >
                  ✓ Payment Successful
                </span>
              </div>

              <p
                style="
                  margin:0 0 14px;
                  font-size:17px;
                  line-height:1.6;
                  color:#ffffff;
                "
              >
                Dear <strong>${donorName}</strong>,
              </p>

              <p
                style="
                  margin:0 0 28px;
                  font-size:15px;
                  line-height:1.75;
                  color:#b9b9bd;
                "
              >
                Your donation has been received successfully.
                Thank you for standing with Amaanitvam Foundation.
                Every contribution helps us continue meaningful work
                in education, community development and social impact.
              </p>

              <!-- RECEIPT -->
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  background:#202023;
                  border:1px solid #38383d;
                  border-radius:10px;
                "
              >
                <tr>
                  <td style="padding:22px;">
                    <div
                      style="
                        margin-bottom:10px;
                        font-size:16px;
                        font-weight:700;
                        color:#ffffff;
                        letter-spacing:.5px;
                      "
                    >
                      🧾 DONATION RECEIPT
                    </div>

                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      border="0"
                    >
                      ${receiptRow(
                        "Amount Donated",
                        amount,
                        true,
                      )}

                      ${receiptRow(
                        "Donated To",
                        destination,
                      )}

                      ${receiptRow(
                        "Transaction ID",
                        transactionId,
                      )}

                      ${receiptRow(
                        "Order ID",
                        orderId,
                      )}

                      ${receiptRow(
                        "Date",
                        donationDate,
                      )}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TAX NOTE -->
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top:24px;
                  background:#1d2229;
                  border-left:4px solid #4b94ff;
                  border-radius:8px;
                "
              >
                <tr>
                  <td
                    style="
                      padding:18px 20px;
                      color:#cbd8ff;
                    "
                  >
                    <div
                      style="
                        font-size:14px;
                        font-weight:700;
                        margin-bottom:7px;
                      "
                    >
                      📄 Tax Documentation
                    </div>

                    <div
                      style="
                        font-size:13px;
                        line-height:1.65;
                        color:#aebfe9;
                      "
                    >
                      Please keep this payment confirmation for your
                      records. For applicable 80G documentation or
                      donation-related queries, contact Amaanitvam
                      Foundation using the reply option on this email.
                    </div>
                  </td>
                </tr>
              </table>

              <div
                align="center"
                style="
                  margin:31px 0 15px;
                  font-size:15px;
                  font-weight:700;
                  color:#d4d4d6;
                "
              >
                Your contribution helps us:
              </div>

              <!-- IMPACT -->
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    width="33%"
                    align="center"
                    class="impact-cell"
                    style="padding:12px 6px;"
                  >
                    <div style="font-size:30px;">📚</div>
                    <div
                      style="
                        margin-top:7px;
                        font-size:13px;
                        color:#d1d1d3;
                      "
                    >
                      Support Education
                    </div>
                  </td>

                  <td
                    width="33%"
                    align="center"
                    class="impact-cell"
                    style="padding:12px 6px;"
                  >
                    <div style="font-size:30px;">🍱</div>
                    <div
                      style="
                        margin-top:7px;
                        font-size:13px;
                        color:#d1d1d3;
                      "
                    >
                      Strengthen Communities
                    </div>
                  </td>

                  <td
                    width="33%"
                    align="center"
                    class="impact-cell"
                    style="padding:12px 6px;"
                  >
                    <div style="font-size:30px;">🤝</div>
                    <div
                      style="
                        margin-top:7px;
                        font-size:13px;
                        color:#d1d1d3;
                      "
                    >
                      Create Social Impact
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div
                align="center"
                style="padding:28px 0 12px;"
              >
                <a
                  href="${WEBSITE_URL}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#e85f78;
                    color:#ffffff;
                    font-size:14px;
                    font-weight:700;
                    text-decoration:none;
                    border-radius:7px;
                  "
                >
                  See Your Impact →
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td
              align="center"
              style="
                padding:27px 25px;
                background:#19191b;
                border-top:1px solid #29292d;
              "
            >
              <div
                style="
                  font-size:17px;
                  font-weight:700;
                  color:#ffffff;
                "
              >
                Amaanitvam Foundation
              </div>

              <div
                style="
                  margin-top:7px;
                  font-size:13px;
                  color:#96969c;
                "
              >
                Empowering Communities Through Compassion & Action
              </div>

              <div
                style="
                  margin-top:14px;
                  font-size:13px;
                "
              >
                <a
                  href="${WEBSITE_URL}"
                  style="
                    color:#7eafff;
                    text-decoration:none;
                  "
                >
                  🌐 www.amaanitvam.org
                </a>
              </div>

              <div
                style="
                  margin-top:20px;
                  padding-top:17px;
                  border-top:1px solid #303034;
                  font-size:11px;
                  line-height:1.6;
                  color:#77777d;
                "
              >
                This is an automated donation confirmation.
                For queries, simply reply to this email.
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
  const amount =
    `₹${money(donation?.amount)}`;

  const destination =
    donationDestination(donation);

  return `
<!doctype html>
<html>
<body
  style="
    margin:0;
    padding:0;
    background:#f3f4f7;
    font-family:Arial,Helvetica,sans-serif;
  "
>
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
  >
    <tr>
      <td
        align="center"
        style="padding:32px 14px;"
      >
        <table
          role="presentation"
          width="600"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width:600px;
            width:100%;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
            border:1px solid #e1e2e7;
          "
        >
          <tr>
            <td
              style="
                padding:27px 30px;
                background:#7b163d;
                color:#ffffff;
              "
            >
              <div
                style="
                  font-size:13px;
                  opacity:.85;
                  text-transform:uppercase;
                  letter-spacing:1px;
                "
              >
                Donation Notification
              </div>

              <div
                style="
                  margin-top:7px;
                  font-size:27px;
                  font-weight:700;
                "
              >
                🎉 New Donation Received
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:30px;">
              <div
                style="
                  padding:22px;
                  background:#fff5f7;
                  border-radius:10px;
                  text-align:center;
                "
              >
                <div
                  style="
                    font-size:13px;
                    color:#7b6670;
                  "
                >
                  Amount Received
                </div>

                <div
                  style="
                    margin-top:5px;
                    font-size:34px;
                    font-weight:700;
                    color:#c63e65;
                  "
                >
                  ${htmlEscape(amount)}
                </div>
              </div>

              <h3
                style="
                  margin:28px 0 12px;
                  color:#25252a;
                "
              >
                Donor Details
              </h3>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="8"
                border="0"
                style="
                  background:#f8f8fa;
                  border-radius:8px;
                  font-size:14px;
                  color:#44444a;
                "
              >
                <tr>
                  <td><strong>Name</strong></td>
                  <td align="right">
                    ${htmlEscape(donation?.name || "N/A")}
                  </td>
                </tr>

                <tr>
                  <td><strong>Email</strong></td>
                  <td align="right">
                    ${htmlEscape(donation?.email || "N/A")}
                  </td>
                </tr>

                <tr>
                  <td><strong>Phone</strong></td>
                  <td align="right">
                    ${htmlEscape(donation?.phone || "N/A")}
                  </td>
                </tr>
              </table>

              <h3
                style="
                  margin:28px 0 12px;
                  color:#25252a;
                "
              >
                Payment Details
              </h3>

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="8"
                border="0"
                style="
                  background:#f8f8fa;
                  border-radius:8px;
                  font-size:14px;
                  color:#44444a;
                "
              >
                <tr>
                  <td><strong>Donated To</strong></td>
                  <td align="right">
                    ${htmlEscape(destination)}
                  </td>
                </tr>

                <tr>
                  <td><strong>Transaction ID</strong></td>
                  <td
                    align="right"
                    style="word-break:break-word;"
                  >
                    ${htmlEscape(
                      donation?.razorpayPaymentId || "N/A",
                    )}
                  </td>
                </tr>

                <tr>
                  <td><strong>Order ID</strong></td>
                  <td
                    align="right"
                    style="word-break:break-word;"
                  >
                    ${htmlEscape(
                      donation?.razorpayOrderId || "N/A",
                    )}
                  </td>
                </tr>

                <tr>
                  <td><strong>Date</strong></td>
                  <td align="right">
                    ${htmlEscape(
                      formatDate(
                        donation?.paidAt ||
                        donation?.updatedAt ||
                        donation?.createdAt,
                      ),
                    )}
                  </td>
                </tr>
              </table>

              <div
                align="center"
                style="padding-top:28px;"
              >
                <a
                  href="${ADMIN_URL}"
                  style="
                    display:inline-block;
                    padding:13px 25px;
                    background:#7b163d;
                    color:#ffffff;
                    text-decoration:none;
                    font-weight:700;
                    border-radius:7px;
                  "
                >
                  Open Admin Portal →
                </a>
              </div>

              <p
                style="
                  margin:27px 0 0;
                  font-size:12px;
                  line-height:1.6;
                  color:#888890;
                  text-align:center;
                "
              >
                Replying to this email will reply directly
                to the donor when a donor email address is available.
              </p>
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

export const sendDonationReceiptEmail = async ({
  donation,
} = {}) => {
  if (emailDisabled()) {
    return {
      success: false,
      skipped: true,
      reason: "email_disabled",
    };
  }

  const donorEmail =
    String(donation?.email || "").trim();

  if (!donorEmail) {
    return {
      success: false,
      skipped: true,
      reason: "missing_donor_email",
    };
  }

  const { replyTo } = resendConfig();

  const destination =
    donationDestination(donation);

  try {
    const result = await sendWithResend({
      to: donorEmail,

      replyTo:
        replyTo || undefined,

      subject:
        `Thank You for Your Donation of ₹${money(
          donation?.amount,
        )} - Amaanitvam Foundation`,

      text: [
        `Dear ${donation?.name || "Donor"},`,
        "",
        "Your donation has been received successfully.",
        "",
        `Amount: ₹${money(donation?.amount)}`,
        `Donated To: ${destination}`,
        `Transaction ID: ${
          donation?.razorpayPaymentId || "N/A"
        }`,
        `Order ID: ${
          donation?.razorpayOrderId || "N/A"
        }`,
        "",
        "Thank you for supporting Amaanitvam Foundation.",
        WEBSITE_URL,
      ].join("\n"),

      html:
        buildDonorEmailHtml(donation),
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
      error:
        error?.message ||
        String(error),
    };
  }
};

export const sendDonationAdminEmail = async ({
  donation,
} = {}) => {
  if (emailDisabled()) {
    return {
      success: false,
      skipped: true,
      reason: "email_disabled",
    };
  }

  const { adminEmail } =
    resendConfig();

  if (!adminEmail) {
    return {
      success: false,
      skipped: true,
      reason: "missing_admin_email",
    };
  }

  const donorEmail =
    String(donation?.email || "").trim();

  const destination =
    donationDestination(donation);

  try {
    const result = await sendWithResend({
      to: adminEmail,

      replyTo:
        donorEmail || undefined,

      subject:
        `New Donation Received - ₹${money(
          donation?.amount,
        )}`,

      text: [
        "New donation received",
        "",
        `Name: ${donation?.name || "N/A"}`,
        `Email: ${donation?.email || "N/A"}`,
        `Phone: ${donation?.phone || "N/A"}`,
        `Amount: ₹${money(donation?.amount)}`,
        `Donated To: ${destination}`,
        `Transaction ID: ${
          donation?.razorpayPaymentId || "N/A"
        }`,
        `Order ID: ${
          donation?.razorpayOrderId || "N/A"
        }`,
      ].join("\n"),

      html:
        buildAdminEmailHtml(donation),
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
      error:
        error?.message ||
        String(error),
    };
  }
};
