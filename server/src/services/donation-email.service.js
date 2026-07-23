import { Resend } from "resend";

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

/**
 * Shared Resend sender for donation-related transactional emails.
 *
 * This intentionally does NOT fall back to SMTP.
 * Donation emails are now delivered through the Resend HTTPS API.
 */
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
  };

  if (html) {
    payload.html = html;
  }

  if (replyTo) {
    payload.replyTo = replyTo;
  }

  const { data, error } = await resend.emails.send(payload);

  if (error) {
    const message =
      error?.message ||
      error?.name ||
      JSON.stringify(error) ||
      "Resend send failed";

    return {
      success: false,
      error: message,
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

/**
 * Donor thank-you / donation receipt email.
 */
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

  const subject =
    `Thank You for Your Donation of ₹${money(
      donation?.amount,
    )} - Amaanitvam Foundation`;

  try {
    const result = await sendWithResend({
      to: donorEmail,

      replyTo:
        replyTo || undefined,

      subject,

      text: [
        `Dear ${donation?.name || "Donor"},`,
        "",
        "Your donation has been received successfully.",
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
        "Amaanitvam Foundation",
        "https://www.amaanitvam.org",
      ].join("\n"),

      html: `
        <div
          style="
            font-family:Arial,sans-serif;
            max-width:640px;
            margin:auto;
            line-height:1.6;
            color:#222;
          "
        >
          <h2 style="color:#7a1238">
            Thank You for Your Donation
          </h2>

          <p>
            Dear ${
              htmlEscape(
                donation?.name || "Donor",
              )
            },
          </p>

          <p>
            Your donation has been received successfully.
            Thank you for supporting Amaanitvam Foundation.
          </p>

          <table
            style="
              border-collapse:collapse;
              width:100%;
            "
          >
            <tr>
              <td>
                <strong>Amount</strong>
              </td>

              <td>
                ₹${money(donation?.amount)}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Donated To</strong>
              </td>

              <td>
                ${htmlEscape(destination)}
              </td>
            </tr>

            <tr>
              <td>
                <strong>Transaction ID</strong>
              </td>

              <td>
                ${
                  htmlEscape(
                    donation?.razorpayPaymentId ||
                      "N/A",
                  )
                }
              </td>
            </tr>

            <tr>
              <td>
                <strong>Order ID</strong>
              </td>

              <td>
                ${
                  htmlEscape(
                    donation?.razorpayOrderId ||
                      "N/A",
                  )
                }
              </td>
            </tr>
          </table>

          <p>
            Regards,
            <br>

            <strong>
              Amaanitvam Foundation
            </strong>
          </p>
        </div>
      `,
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

/**
 * Admin notification after successful donation.
 */
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

      // Clicking Reply on the admin notification
      // replies directly to the donor.
      replyTo:
        donorEmail || undefined,

      subject:
        `New Donation Received - ₹${money(
          donation?.amount,
        )}`,

      text: [
        "New donation received",
        `Name: ${
          donation?.name || "N/A"
        }`,
        `Email: ${
          donation?.email || "N/A"
        }`,
        `Phone: ${
          donation?.phone || "N/A"
        }`,
        `Amount: ₹${money(
          donation?.amount,
        )}`,
        `Donated To: ${destination}`,
        `Transaction ID: ${
          donation?.razorpayPaymentId ||
          "N/A"
        }`,
        `Order ID: ${
          donation?.razorpayOrderId ||
          "N/A"
        }`,
      ].join("\n"),
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
