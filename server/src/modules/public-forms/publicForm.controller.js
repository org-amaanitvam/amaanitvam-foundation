import crypto from "node:crypto";
import ContactMessage from "./contact.model.js";
import ContactOtp from "./contactOtp.model.js";
import EventRegistration from "./eventRegistration.model.js";
import { sendEmail } from "../../services/email.service.js";

const clean = (value, max = 5000) =>
  String(value ?? "").trim().slice(0, max);

const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validPhone = (value) =>
  /^[6-9]\d{9}$/.test(value);

const metadataFor = (req) => ({
  userAgent: clean(req.get("user-agent"), 500),
  forwardedFor: clean(req.get("x-forwarded-for"), 300),
});

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 45;

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const hashOtp = (otp, email) =>
  crypto
    .createHash("sha256")
    .update(`${email}:${otp}:${process.env.OTP_SALT || "amaanitvam-contact"}`)
    .digest("hex");

export const requestContactOtp = async (req, res, next) => {
  try {
    const email = clean(req.body?.email, 180).toLowerCase();

    if (!validEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const existing = await ContactOtp.findOne({ email }).sort({ createdAt: -1 });
    if (existing) {
      const secondsSinceLastSend = (Date.now() - existing.createdAt.getTime()) / 1000;
      if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend)}s before requesting another code.`,
        });
      }
      await ContactOtp.deleteMany({ email, verified: false });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp, email);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await ContactOtp.create({ email, otpHash, expiresAt });

    await sendEmail({
      to: email,
      subject: "Your Amaanitvam Foundation verification code",
      text: `Your verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`,
      html: `<p>Your verification code is <strong style="font-size:1.2em;">${otp}</strong>.</p><p>It expires in ${OTP_TTL_MINUTES} minutes. If you didn't request this, you can safely ignore this email.</p>`,
    });

    return res.json({
      success: true,
      message: `A verification code has been sent to ${email}.`,
      expiresInSeconds: OTP_TTL_MINUTES * 60,
    });
  } catch (error) {
    next(error);
  }
};

export const submitContact = async (req, res, next) => {
  try {
    const name = clean(req.body?.name, 120);
    const email = clean(req.body?.email, 180).toLowerCase();
    const subject = clean(req.body?.subject, 200);
    const message = clean(req.body?.message, 5000);
    const otp = clean(req.body?.otp, 10);

    if (name.length < 2 || !validEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name and email address.",
      });
    }

    if (subject.length < 3 || message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a subject and a meaningful message.",
      });
    }

    if (!otp) {
      return res.status(400).json({
        success: false,
        code: "OTP_REQUIRED",
        message: "Please verify your email with the code we sent you.",
      });
    }

    const otpRecord = await ContactOtp.findOne({ email }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        code: "OTP_EXPIRED",
        message: "Your verification code has expired. Please request a new one.",
      });
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      await ContactOtp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        code: "OTP_LOCKED",
        message: "Too many incorrect attempts. Please request a new code.",
      });
    }

    if (otpRecord.otpHash !== hashOtp(otp, email)) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        success: false,
        code: "OTP_INCORRECT",
        message: "That verification code is incorrect. Please try again.",
      });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      metadata: metadataFor(req),
    });

    await ContactOtp.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contactId: contact._id,
    });
  } catch (error) {
    next(error);
  }
};

export const registerForEvent = async (req, res, next) => {
  try {
    const name = clean(req.body?.name, 120);
    const email = clean(req.body?.email, 180).toLowerCase();
    const phone = clean(req.body?.phone, 20);
    const event = clean(req.body?.event, 200);
    const organization = clean(req.body?.organization, 200);
    const message = clean(req.body?.message, 3000);

    if (name.length < 2 || !validEmail(email) || !validPhone(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid name, email and 10-digit Indian mobile number.",
      });
    }

    if (event.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please select or enter an event.",
      });
    }

    const registration = await EventRegistration.create({
      name,
      email,
      phone,
      event,
      organization,
      message,
      metadata: metadataFor(req),
    });

    return res.status(201).json({
      success: true,
      message: "Your event registration has been completed.",
      registrationId: registration._id,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This email address is already registered for the selected event.",
      });
    }

    next(error);
  }
};

export const listContacts = async (_req, res, next) => {
  try {
    const contacts = await ContactMessage.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, contacts, data: contacts });
  } catch (error) {
    next(error);
  }
};

export const listEventRegistrations = async (_req, res, next) => {
  try {
    const registrations = await EventRegistration.find({}).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      registrations,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};
