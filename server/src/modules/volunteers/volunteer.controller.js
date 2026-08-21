import Candidate from "../candidates/candidate.model.js";
import { ensureResumeUrl } from "../../services/resumeUrl.service.js";
import { uploadApplicationResume } from "../../services/resumeUpload.service.js";

const clean = (value, max = 4000) =>
  String(value ?? "").trim().slice(0, max);

const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validPhone = (value) =>
  /^[6-9]\d{9}$/.test(value);

export const submitVolunteerApplication = async (req, res, next) => {
  try {
    const name = clean(req.body?.name, 120);
    const email = clean(req.body?.email, 180).toLowerCase();
    const phone = clean(req.body?.phone, 20);
    const role = clean(req.body?.role, 120);
    const availability = clean(req.body?.availability, 180);
    const skills = clean(req.body?.skills, 500);
    const motivation = clean(
      req.body?.motivation ||
      req.body?.reason,
      4000,
    );

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid full name.",
      });
    }

    if (!validEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!validPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    if (!role || !availability || motivation.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a preferred volunteer role, provide your availability and enter a motivation statement of at least 10 characters.",
      });
    }

    const resume = await uploadApplicationResume(req.file, "volunteer");

    const candidate = await Candidate.create({
      name,
      email,
      phone,
      applicationType: "volunteer",
      role,
      availability,
      skills,
      motivation,
      resumeUrl: resume.url,
      resumePublicId: resume.publicId,
      resumeStorage: resume.storage,
      resumeData: resume.storage === "mongodb" ? resume.buffer : undefined,
      resumeOriginalName: req.file.originalname || "",
      resumeMimeType: req.file.mimetype || "",
      metadata: {
        userAgent: clean(req.get("user-agent"), 500),
        forwardedFor: clean(req.get("x-forwarded-for"), 300),
      },
    });
    await ensureResumeUrl(candidate);


    return res.status(201).json({
      success: true,
      message:
        "Your volunteer application has been submitted successfully.",
      applicationId: candidate._id,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const getAll = async (_req, res, next) => {
  try {
    const data = await Candidate.find({
      applicationType: "volunteer",
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data, candidates: data });
  } catch (error) {
    next(error);
  }
};
