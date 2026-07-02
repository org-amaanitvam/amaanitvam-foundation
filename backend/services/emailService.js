import { createTransporter, getAdminEmail, getFromAddress } from "../config/mailer.js";

const ORGANIZATION_NAME = "Amaanitvam Foundation";
const ORGANIZATION_EMAIL = "amaanitvamfoundation@gmail.com";
const ORGANIZATION_PHONE = "+91 98999 23266";
const ORGANIZATION_ADDRESS = "H.No. 269, W.No. 2, Mehrauli, Gadaipur, South West Delhi, New Delhi, Delhi, India - 110030";
const WHATSAPP_INVITE_URL = "https://chat.whatsapp.com/DhebPGMO2JILFfja86gybF";

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

const toHtmlParagraph = (value = "") => escapeHtml(value).replace(/\n/g, "<br>");

const formatDateTime = (value) =>
    new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });

const renderEmailShell = ({ title, body, footerNote }) => `
    <div style="margin:0;padding:0;background:#f6f8fb;">
        <div style="max-width:680px;margin:0 auto;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#172033;">
            <div style="background:#ffffff;border:1px solid #e6ebf2;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.06);">
                <div style="background:linear-gradient(135deg,#0f1e3a 0%,#153d6f 100%);padding:24px 28px;color:#ffffff;">
                    <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">${ORGANIZATION_NAME}</div>
                    <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">${escapeHtml(title)}</h1>
                </div>
                <div style="padding:28px;line-height:1.7;font-size:15px;">
                    ${body}
                </div>
                <div style="padding:0 28px 28px;">
                    <div style="border-top:1px solid #e6ebf2;padding-top:18px;font-size:13px;color:#516079;">
                        ${escapeHtml(footerNote)}
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

export const sendUserAutoReplyEmail = async ({ contact }) => {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();
    const submissionTime = formatDateTime(contact.submissionTimestamp || contact.createdAt || Date.now());

    const html = renderEmailShell({
        title: "Thank You for Contacting Amaanitvam Foundation",
        body: `
            <p>Dear ${escapeHtml(contact.name)},</p>
            <p>Thank you for contacting Amaanitvam Foundation. We have successfully received your message and our team will review it shortly.</p>
            <p>Our team will get in touch with you as soon as possible.</p>
            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#eefaf2;border:1px solid #ccebd7;">
                <p style="margin:0 0 12px;font-weight:700;color:#0f5132;">Please join the WhatsApp community to stay updated and in touch with us.</p>
                <a href="${WHATSAPP_INVITE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;background:#25d366;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;padding:14px 22px;border-radius:999px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" role="img" style="display:block;flex:0 0 auto;fill:#ffffff;"><path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.42 0 .02 5.4.02 12.03c0 2.12.56 4.18 1.62 6L0 24l6.14-1.61a11.98 11.98 0 0 0 5.92 1.51h.01c6.64 0 12.03-5.4 12.03-12.03 0-3.22-1.26-6.25-3.58-8.39Zm-8.46 18.51h-.01a9.96 9.96 0 0 1-5.07-1.39l-.36-.21-3.65.96.98-3.56-.24-.37a9.95 9.95 0 0 1-1.53-5.3C1.68 6.33 6.09 1.93 12.07 1.93c2.65 0 5.14.97 7.05 2.74a9.88 9.88 0 0 1 3.12 7.36c0 5.98-4.42 11.96-10.18 11.96Zm5.78-7.44c-.31-.16-1.86-.92-2.14-1.02-.29-.11-.5-.16-.72.16s-.83 1.02-1.02 1.23c-.19.22-.38.25-.7.08-.31-.16-1.34-.49-2.56-1.56-.95-.85-1.59-1.9-1.78-2.21-.19-.31-.02-.48.14-.64.14-.14.31-.38.47-.57.16-.19.21-.31.31-.52.1-.21.05-.39-.02-.55-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55-.18-.01-.39-.01-.6-.01-.21 0-.55.08-.84.39-.29.31-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.31c.16.22 2.25 3.44 5.45 4.82.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.86-.76 2.12-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37Z"/></svg>
                    <span>Join WhatsApp</span>
                </a>
            </div>
            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#f8fafc;border:1px solid #e6ebf2;">
                <p style="margin:0 0 8px;"><strong>Your Submission</strong></p>
                <p style="margin:0;"><strong>Subject:</strong> ${escapeHtml(contact.subject)}</p>
                <p style="margin:0;"><strong>Submitted:</strong> ${escapeHtml(submissionTime)}</p>
            </div>
            <p style="margin-bottom:0;">Regards,<br>${ORGANIZATION_NAME} Team</p>
        `,
        footerNote: `For any follow-up, contact us at ${ORGANIZATION_EMAIL} or ${ORGANIZATION_PHONE}. ${ORGANIZATION_ADDRESS}`
    });

    await transporter.sendMail({
        from: fromAddress,
        to: contact.email,
        subject: "Thank You for Contacting Amaanitvam Foundation",
        text: [
            `Dear ${contact.name},`,
            "",
            "Thank you for contacting Amaanitvam Foundation. We have successfully received your message and our team will review it shortly.",
            "Our team will get in touch with you as soon as possible.",
            "Please join the WhatsApp community to stay updated and in touch with us.",
            `WhatsApp: ${WHATSAPP_INVITE_URL}`,
            "",
            "Regards,",
            `${ORGANIZATION_NAME} Team`,
            "",
            `Contact: ${ORGANIZATION_EMAIL} | ${ORGANIZATION_PHONE}`,
            ORGANIZATION_ADDRESS
        ].join("\n"),
        html
    });

    return true;
};

export const sendAdminNotificationEmail = async ({ contact }) => {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();
    const adminEmail = getAdminEmail();
    const submissionTime = formatDateTime(contact.submissionTimestamp || contact.createdAt || Date.now());

    const html = renderEmailShell({
        title: "New Contact Form Submission Received",
        body: `
            <p>A new contact form submission has been received. The details are below in report format.</p>
            <table style="width:100%;border-collapse:collapse;border:1px solid #dce4ef;font-size:14px;">
                <tbody>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;width:32%;">Record ID</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(contact._id?.toString())}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Full Name</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(contact.name)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Email Address</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(contact.email)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Subject</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(contact.subject)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Message</td><td style="padding:12px;border:1px solid #dce4ef;white-space:pre-wrap;">${toHtmlParagraph(contact.message)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Submission Time</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(submissionTime)}</td></tr>
                </tbody>
            </table>
        `,
        footerNote: `This is an automated notification for ${ORGANIZATION_NAME}. Reply directly to the sender only after reviewing the submission.`
    });

    await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        replyTo: contact.email,
        subject: "New Contact Form Submission Received",
        text: [
            "New Contact Form Submission Received",
            "",
            `Record ID: ${contact._id?.toString()}`,
            `Full Name: ${contact.name}`,
            `Email Address: ${contact.email}`,
            `Subject: ${contact.subject}`,
            `Message: ${contact.message}`,
            `Submission Time: ${submissionTime}`
        ].join("\n"),
        html
    });

    return true;
};

export const sendInternshipConfirmationEmail = async ({ application }) => {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();
    const submissionTime = formatDateTime(application.submissionTimestamp || application.createdAt || Date.now());

    const html = renderEmailShell({
        title: "Thank You for Your Internship Application",
        body: `
            <p>Dear ${escapeHtml(application.name)},</p>
            <p>Thank you for applying for the ${escapeHtml(application.track)} internship track. We have received your application and will review it shortly.</p>
            <p>Our team will get in touch with you as soon as possible.</p>
            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#eefaf2;border:1px solid #ccebd7;">
                <p style="margin:0 0 12px;font-weight:700;color:#0f5132;">Please join the WhatsApp community to stay updated and in touch with us.</p>
                <a href="${WHATSAPP_INVITE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;background:#25d366;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;padding:14px 22px;border-radius:999px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" role="img" style="display:block;flex:0 0 auto;fill:#ffffff;"><path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.42 0 .02 5.4.02 12.03c0 2.12.56 4.18 1.62 6L0 24l6.14-1.61a11.98 11.98 0 0 0 5.92 1.51h.01c6.64 0 12.03-5.4 12.03-12.03 0-3.22-1.26-6.25-3.58-8.39Zm-8.46 18.51h-.01a9.96 9.96 0 0 1-5.07-1.39l-.36-.21-3.65.96.98-3.56-.24-.37a9.95 9.95 0 0 1-1.53-5.3C1.68 6.33 6.09 1.93 12.07 1.93c2.65 0 5.14.97 7.05 2.74a9.88 9.88 0 0 1 3.12 7.36c0 5.98-4.42 11.96-10.18 11.96Zm5.78-7.44c-.31-.16-1.86-.92-2.14-1.02-.29-.11-.5-.16-.72.16s-.83 1.02-1.02 1.23c-.19.22-.38.25-.7.08-.31-.16-1.34-.49-2.56-1.56-.95-.85-1.59-1.9-1.78-2.21-.19-.31-.02-.48.14-.64.14-.14.31-.38.47-.57.16-.19.21-.31.31-.52.1-.21.05-.39-.02-.55-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55-.18-.01-.39-.01-.6-.01-.21 0-.55.08-.84.39-.29.31-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.31c.16.22 2.25 3.44 5.45 4.82.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.86-.76 2.12-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37Z"/></svg>
                    <span>Join WhatsApp</span>
                </a>
            </div>
            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#f8fafc;border:1px solid #e6ebf2;">
                <p style="margin:0 0 8px;"><strong>Your Submission</strong></p>
                <p style="margin:0;"><strong>Track:</strong> ${escapeHtml(application.track)}</p>
                <p style="margin:0;"><strong>Submitted:</strong> ${escapeHtml(submissionTime)}</p>
            </div>
            <p style="margin-bottom:0;">Regards,<br>${ORGANIZATION_NAME} Team</p>
        `,
        footerNote: `For any follow-up, contact us at ${ORGANIZATION_EMAIL} or ${ORGANIZATION_PHONE}. ${ORGANIZATION_ADDRESS}`
    });

    await transporter.sendMail({
        from: fromAddress,
        to: application.email,
        subject: "Internship Application Received — Amaanitvam Foundation",
        text: [
            `Dear ${application.name},`,
            "",
            `Thank you for applying for the ${application.track} internship track. We have received your application and will review it shortly.`,
            "Our team will get in touch with you as soon as possible.",
            "Please join the WhatsApp community to stay updated and in touch with us.",
            `WhatsApp: ${WHATSAPP_INVITE_URL}`,
            "",
            "Regards,",
            `${ORGANIZATION_NAME} Team`,
            "",
            `Contact: ${ORGANIZATION_EMAIL} | ${ORGANIZATION_PHONE}`,
            ORGANIZATION_ADDRESS
        ].join("\n"),
        html
    });

    return true;
};

export const sendInternshipAdminEmail = async ({ application, resumeFile }) => {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();
    const adminEmail = getAdminEmail();
    const submissionTime = formatDateTime(application.submissionTimestamp || application.createdAt || Date.now());

    const html = renderEmailShell({
        title: "New Internship Application Received",
        body: `
            <p>A new internship application has been received. The details are below in report format.</p>
            <table style="width:100%;border-collapse:collapse;border:1px solid #dce4ef;font-size:14px;">
                <tbody>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;width:32%;">Record ID</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application._id?.toString())}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Full Name</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.name)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Email Address</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.email)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Phone</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.phone)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Track</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.track)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">University</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.university)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Current Year</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.currentYear)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Motivation</td><td style="padding:12px;border:1px solid #dce4ef;white-space:pre-wrap;">${toHtmlParagraph(String(application.motivation || "").slice(0, 500))}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Portfolio URL</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.portfolioUrl)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Duration</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.duration)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Submission Time</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(submissionTime)}</td></tr>
                </tbody>
            </table>
        `,
        footerNote: `This is an automated notification for ${ORGANIZATION_NAME}. Reply directly to the sender only after reviewing the submission.`
    });

    const mailOptions = {
        from: fromAddress,
        to: adminEmail,
        replyTo: application.email,
        subject: `New Internship Application — ${application.track}`,
        text: [
            "New Internship Application Received",
            "",
            `Record ID: ${application._id?.toString()}`,
            `Full Name: ${application.name}`,
            `Email Address: ${application.email}`,
            `Phone: ${application.phone}`,
            `Track: ${application.track}`,
            `University: ${application.university}`,
            `Current Year: ${application.currentYear}`,
            `Motivation: ${String(application.motivation || "").slice(0, 500)}`,
            `Portfolio URL: ${application.portfolioUrl}`,
            `Duration: ${application.duration}`,
            `Submission Time: ${submissionTime}`
        ].join("\n"),
        html
    };

    if (resumeFile) {
        mailOptions.attachments = [
            {
                filename: resumeFile.originalname,
                content: resumeFile.buffer
            }
        ];
    }

    await transporter.sendMail(mailOptions);

    return true;
};

export const sendVolunteerConfirmationEmail = async ({ application }) => {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();
    const submissionTime = formatDateTime(application.submissionTimestamp || application.createdAt || Date.now());

    const html = renderEmailShell({
        title: "Thank You for Volunteering with Amaanitvam Foundation",
        body: `
            <p>Dear ${escapeHtml(application.name)},</p>
            <p>Thank you for expressing interest in volunteering for ${escapeHtml(application.role)}. We have received your application and will be in touch.</p>
            <p>Our team will get in touch with you as soon as possible.</p>
            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#eefaf2;border:1px solid #ccebd7;">
                <p style="margin:0 0 12px;font-weight:700;color:#0f5132;">Please join the WhatsApp community to stay updated and in touch with us.</p>
                <a href="${WHATSAPP_INVITE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;background:#25d366;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;padding:14px 22px;border-radius:999px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" role="img" style="display:block;flex:0 0 auto;fill:#ffffff;"><path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.42 0 .02 5.4.02 12.03c0 2.12.56 4.18 1.62 6L0 24l6.14-1.61a11.98 11.98 0 0 0 5.92 1.51h.01c6.64 0 12.03-5.4 12.03-12.03 0-3.22-1.26-6.25-3.58-8.39Zm-8.46 18.51h-.01a9.96 9.96 0 0 1-5.07-1.39l-.36-.21-3.65.96.98-3.56-.24-.37a9.95 9.95 0 0 1-1.53-5.3C1.68 6.33 6.09 1.93 12.07 1.93c2.65 0 5.14.97 7.05 2.74a9.88 9.88 0 0 1 3.12 7.36c0 5.98-4.42 11.96-10.18 11.96Zm5.78-7.44c-.31-.16-1.86-.92-2.14-1.02-.29-.11-.5-.16-.72.16s-.83 1.02-1.02 1.23c-.19.22-.38.25-.7.08-.31-.16-1.34-.49-2.56-1.56-.95-.85-1.59-1.9-1.78-2.21-.19-.31-.02-.48.14-.64.14-.14.31-.38.47-.57.16-.19.21-.31.31-.52.1-.21.05-.39-.02-.55-.08-.16-.72-1.74-.99-2.38-.26-.62-.53-.54-.72-.55-.18-.01-.39-.01-.6-.01-.21 0-.55.08-.84.39-.29.31-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.31c.16.22 2.25 3.44 5.45 4.82.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.86-.76 2.12-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37Z"/></svg>
                    <span>Join WhatsApp</span>
                </a>
            </div>
            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#f8fafc;border:1px solid #e6ebf2;">
                <p style="margin:0 0 8px;"><strong>Your Submission</strong></p>
                <p style="margin:0;"><strong>Role:</strong> ${escapeHtml(application.role)}</p>
                <p style="margin:0;"><strong>Availability:</strong> ${escapeHtml(application.availability)}</p>
                <p style="margin:0;"><strong>Submitted:</strong> ${escapeHtml(submissionTime)}</p>
            </div>
            <p style="margin-bottom:0;">Regards,<br>${ORGANIZATION_NAME} Team</p>
        `,
        footerNote: `For any follow-up, contact us at ${ORGANIZATION_EMAIL} or ${ORGANIZATION_PHONE}. ${ORGANIZATION_ADDRESS}`
    });

    await transporter.sendMail({
        from: fromAddress,
        to: application.email,
        subject: "Volunteer Registration Received — Amaanitvam Foundation",
        text: [
            `Dear ${application.name},`,
            "",
            `Thank you for expressing interest in volunteering for ${application.role}. We have received your application and will be in touch.`,
            "Our team will get in touch with you as soon as possible.",
            "Please join the WhatsApp community to stay updated and in touch with us.",
            `WhatsApp: ${WHATSAPP_INVITE_URL}`,
            "",
            "Regards,",
            `${ORGANIZATION_NAME} Team`,
            "",
            `Contact: ${ORGANIZATION_EMAIL} | ${ORGANIZATION_PHONE}`,
            ORGANIZATION_ADDRESS
        ].join("\n"),
        html
    });

    return true;
};

export const sendVolunteerAdminEmail = async ({ application }) => {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();
    const adminEmail = getAdminEmail();
    const submissionTime = formatDateTime(application.submissionTimestamp || application.createdAt || Date.now());

    const html = renderEmailShell({
        title: "New Volunteer Registration Received",
        body: `
            <p>A new volunteer registration has been received. The details are below in report format.</p>
            <table style="width:100%;border-collapse:collapse;border:1px solid #dce4ef;font-size:14px;">
                <tbody>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;width:32%;">Record ID</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application._id?.toString())}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Full Name</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.name)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Email Address</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.email)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Phone</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.phone)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Role</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.role)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Availability</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.availability)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Skills</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(application.skills)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Motivation</td><td style="padding:12px;border:1px solid #dce4ef;white-space:pre-wrap;">${toHtmlParagraph(String(application.motivation || "").slice(0, 500))}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Submission Time</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(submissionTime)}</td></tr>
                </tbody>
            </table>
        `,
        footerNote: `This is an automated notification for ${ORGANIZATION_NAME}. Reply directly to the sender only after reviewing the submission.`
    });

    await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        replyTo: application.email,
        subject: `New Volunteer Registration — ${application.role}`,
        text: [
            "New Volunteer Registration Received",
            "",
            `Record ID: ${application._id?.toString()}`,
            `Full Name: ${application.name}`,
            `Email Address: ${application.email}`,
            `Phone: ${application.phone}`,
            `Role: ${application.role}`,
            `Availability: ${application.availability}`,
            `Skills: ${application.skills}`,
            `Motivation: ${String(application.motivation || "").slice(0, 500)}`,
            `Submission Time: ${submissionTime}`
        ].join("\n"),
        html
    });

    return true;
};

export const sendDonationReceiptEmail = async ({ donation }) => {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();
    const submissionTime = formatDateTime(donation.submissionTimestamp || donation.createdAt || Date.now());

    const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0
    }).format(donation.amount);

    const html = renderEmailShell({
        title: "Thank You for Your Generous Donation",
        body: `
            <p>Dear ${escapeHtml(donation.name)},</p>
            <p>Thank you for your generous donation of <strong>${escapeHtml(formattedAmount)}</strong> to Amaanitvam Foundation. Your contribution directly supports our mission to create lasting social impact.</p>
            <p>This email serves as your official donation receipt.</p>
            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#eefaf2;border:1px solid #ccebd7;">
                <p style="margin:0 0 12px;font-weight:700;color:#0f5132;">Please join the WhatsApp community to stay updated and in touch with us.</p>
                <a href="${WHATSAPP_INVITE_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;background:#25d366;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;padding:14px 22px;border-radius:999px;">
                    <span>Join WhatsApp</span>
                </a>
            </div>
            <div style="margin:24px 0;padding:18px;border-radius:12px;background:#f8fafc;border:1px solid #e6ebf2;">
                <p style="margin:0 0 8px;"><strong>Donation Receipt</strong></p>
                <p style="margin:0;"><strong>Amount:</strong> ${escapeHtml(formattedAmount)}</p>
                <p style="margin:0;"><strong>Transaction ID:</strong> ${escapeHtml(donation.razorpayPaymentId)}</p>
                <p style="margin:0;"><strong>Order ID:</strong> ${escapeHtml(donation.razorpayOrderId)}</p>
                <p style="margin:0;"><strong>Date:</strong> ${escapeHtml(submissionTime)}</p>
                <p style="margin:0;"><strong>Status:</strong> ✅ Payment Successful</p>
            </div>
            <p>All donations to Amaanitvam Foundation are eligible for tax deduction under <strong>Section 80G</strong> of the Income Tax Act.</p>
            <p style="margin-bottom:0;">With gratitude,<br>${ORGANIZATION_NAME} Team</p>
        `,
        footerNote: `For any follow-up, contact us at ${ORGANIZATION_EMAIL} or ${ORGANIZATION_PHONE}. ${ORGANIZATION_ADDRESS}`
    });

    await transporter.sendMail({
        from: fromAddress,
        to: donation.email,
        subject: `Donation Receipt — ${formattedAmount} — Amaanitvam Foundation`,
        text: [
            `Dear ${donation.name},`,
            "",
            `Thank you for your generous donation of ${formattedAmount} to Amaanitvam Foundation.`,
            "",
            "Donation Receipt:",
            `Amount: ${formattedAmount}`,
            `Transaction ID: ${donation.razorpayPaymentId}`,
            `Order ID: ${donation.razorpayOrderId}`,
            `Date: ${submissionTime}`,
            `Status: Payment Successful`,
            "",
            "All donations are eligible for tax deduction under Section 80G of the Income Tax Act.",
            "",
            "With gratitude,",
            `${ORGANIZATION_NAME} Team`,
            "",
            `Contact: ${ORGANIZATION_EMAIL} | ${ORGANIZATION_PHONE}`,
            ORGANIZATION_ADDRESS
        ].join("\n"),
        html
    });

    return true;
};

export const sendDonationAdminEmail = async ({ donation }) => {
    const transporter = createTransporter();
    const fromAddress = getFromAddress();
    const adminEmail = getAdminEmail();
    const submissionTime = formatDateTime(donation.submissionTimestamp || donation.createdAt || Date.now());

    const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0
    }).format(donation.amount);

    const html = renderEmailShell({
        title: "New Donation Received 🎉",
        body: `
            <p>A new donation has been successfully received and verified. The details are below.</p>
            <table style="width:100%;border-collapse:collapse;border:1px solid #dce4ef;font-size:14px;">
                <tbody>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;width:32%;">Record ID</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(donation._id?.toString())}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Donor Name</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(donation.name)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Email</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(donation.email)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Phone</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(donation.phone || "Not provided")}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#eefaf2;font-weight:700;color:#0f5132;">Amount</td><td style="padding:12px;border:1px solid #dce4ef;font-weight:700;color:#0f5132;font-size:16px;">${escapeHtml(formattedAmount)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Razorpay Payment ID</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(donation.razorpayPaymentId)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Razorpay Order ID</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(donation.razorpayOrderId)}</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Payment Status</td><td style="padding:12px;border:1px solid #dce4ef;">✅ Paid</td></tr>
                    <tr><td style="padding:12px;border:1px solid #dce4ef;background:#f8fafc;font-weight:700;">Donation Time</td><td style="padding:12px;border:1px solid #dce4ef;">${escapeHtml(submissionTime)}</td></tr>
                </tbody>
            </table>
        `,
        footerNote: `This is an automated notification for ${ORGANIZATION_NAME}. Verify payment on the Razorpay dashboard.`
    });

    await transporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        replyTo: donation.email,
        subject: `💰 New Donation Received — ${formattedAmount}`,
        text: [
            "New Donation Received",
            "",
            `Record ID: ${donation._id?.toString()}`,
            `Donor Name: ${donation.name}`,
            `Email: ${donation.email}`,
            `Phone: ${donation.phone || "Not provided"}`,
            `Amount: ${formattedAmount}`,
            `Razorpay Payment ID: ${donation.razorpayPaymentId}`,
            `Razorpay Order ID: ${donation.razorpayOrderId}`,
            `Status: Paid`,
            `Donation Time: ${submissionTime}`
        ].join("\n"),
        html
    });

    return true;
};