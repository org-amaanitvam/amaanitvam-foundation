const isEmailDisabled = () =>
  String(process.env.EMAIL_DISABLED || "").trim().toLowerCase() === "true";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const sendCredentialEmail = async ({
  to,
  name,
  uniqueId,
  temporaryPassword,
}) => {
  if (isEmailDisabled()) {
    return { sent: false, skipped: true, reason: "EMAIL_DISABLED=true" };
  }

  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const fromEmail = String(process.env.RESEND_FROM_EMAIL || "").trim();
  const fromName =
    String(process.env.RESEND_FROM_NAME || "").trim() || "Amaanitvam Foundation";
  const replyTo = String(process.env.RESEND_REPLY_TO || "").trim();

  if (!apiKey || !fromEmail) {
    return {
      sent: false,
      skipped: true,
      reason: "RESEND_API_KEY or RESEND_FROM_EMAIL is missing",
    };
  }

  const safeName = escapeHtml(name || "Team Member");
  const safeUniqueId = escapeHtml(uniqueId);
  const safePassword = escapeHtml(temporaryPassword);

  const payload = {
    from: `${fromName} <${fromEmail}>`,
    to: [to],
    subject: "Your Amaanitvam Dashboard Credentials",
    html: `
      <div style="margin:0;background:#f6f7f4;padding:32px 12px;font-family:Arial,sans-serif;color:#263128">
        <div style="max-width:620px;margin:auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e8e2">
          <div style="background:#244b38;color:#ffffff;padding:26px 30px">
            <div style="font-size:22px;font-weight:700">Amaanitvam Foundation</div>
            <div style="margin-top:6px;opacity:.9">Dashboard account created</div>
          </div>
          <div style="padding:30px">
            <p style="font-size:16px;line-height:1.6">Hello ${safeName},</p>
            <p style="font-size:15px;line-height:1.7">
              Your Amaanitvam dashboard account has been created. Use the credentials below for your first sign-in.
            </p>
            <div style="background:#f4f7f3;border-radius:12px;padding:18px;margin:22px 0">
              <div style="margin-bottom:10px"><strong>Unique ID:</strong> ${safeUniqueId}</div>
              <div><strong>Temporary password:</strong> ${safePassword}</div>
            </div>
            <p style="font-size:14px;line-height:1.7;color:#566158">
              For security, you must change the temporary password immediately after your first login.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Resend credential email failed (${response.status}): ${
        body?.message || "Unknown error"
      }`
    );
  }

  return { sent: true, id: body?.id || null };
};
