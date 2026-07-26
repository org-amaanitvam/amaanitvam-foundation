import Candidate from "../candidates/candidate.model.js";
import {
  uploadApplicationResume,
} from "../../services/resumeUpload.service.js";
import {
  INTERNSHIP_DOMAINS,
  canonicalInternshipDomain,
} from "../../constants/internshipDomains.js";

const clean = (value, max = 4000) =>
  String(value ?? "").trim().slice(0, max);

const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validPhone = (value) =>
  /^[6-9]\d{9}$/.test(value);

export const getInternshipDomains = (
  _req,
  res,
) =>
  res.json({
    success: true,
    domains: INTERNSHIP_DOMAINS,
    data: INTERNSHIP_DOMAINS,
  });

export const submitInternshipApplication = async (
  req,
  res,
  next,
) => {
  try {
    const name = clean(req.body?.name, 120);
    const email = clean(
      req.body?.email,
      180,
    ).toLowerCase();
    const phone = clean(req.body?.phone, 20);
    const university = clean(
      req.body?.university,
      180,
    );
    const currentYear = clean(
      req.body?.currentYear,
      80,
    );
    const duration = clean(
      req.body?.duration,
      100,
    );
    const portfolioUrl = clean(
      req.body?.portfolioUrl,
      500,
    );
    const requestedTrack = clean(
      req.body?.track ||
        req.body?.domain ||
        req.body?.internshipDomain,
      120,
    );
    const track =
      canonicalInternshipDomain(requestedTrack);
    const motivation = clean(
      req.body?.motivation ||
        req.body?.reason,
      4000,
    );

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid full name.",
      });
    }

    if (!validEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    if (!validPhone(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    if (!track) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a valid internship domain.",
        allowedDomains: INTERNSHIP_DOMAINS,
      });
    }

    if (motivation.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a motivation statement of at least 10 characters.",
      });
    }

    if (portfolioUrl) {
      try {
        const parsed = new URL(portfolioUrl);

        if (
          !["http:", "https:"].includes(
            parsed.protocol,
          )
        ) {
          throw new Error();
        }
      } catch {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid Portfolio or LinkedIn URL.",
        });
      }
    }

    const resume =
      await uploadApplicationResume(
        req.file,
        "internship",
      );

    const candidate =
      await Candidate.create({
        name,
        email,
        phone,
        applicationType: "internship",
        track,
        university,
        currentYear,
        duration,
        portfolioUrl,
        motivation,
        resumeUrl: resume.url,
        resumePublicId: resume.publicId,
        resumeOriginalName:
          req.file.originalname || "",
        resumeMimeType:
          req.file.mimetype || "",
        metadata: {
          userAgent: clean(
            req.get("user-agent"),
            500,
          ),
          forwardedFor: clean(
            req.get("x-forwarded-for"),
            300,
          ),
        },
      });

    return res.status(201).json({
      success: true,
      message:
        "Thank you for applying for an internship with Amaanitvam Foundation. Your application has been received successfully and will be reviewed by our team.",
      applicationId: candidate._id,
      domain: track,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res
        .status(error.statusCode)
        .json({
          success: false,
          message: error.message,
        });
    }

    next(error);
  }
};

export const getAll = async (
  _req,
  res,
  next,
) => {
  try {
    const data = await Candidate.find({
      applicationType: "internship",
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data,
      candidates: data,
      domains: INTERNSHIP_DOMAINS,
    });
  } catch (error) {
    next(error);
  }
};
