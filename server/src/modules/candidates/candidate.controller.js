import Candidate from "./candidate.model.js";
import { INTERNSHIP_DOMAINS } from "../../constants/internshipDomains.js";

const ALLOWED_STATUSES = new Set([
  "pending",
  "shortlisted",
  "rejected",
]);

export const getAll = async (req, res, next) => {
  try {
    const query = {};

    const status = String(req.query?.status || "")
      .trim()
      .toLowerCase();

    const domain = String(req.query?.domain || "").trim();
    const search = String(req.query?.search || "").trim();

    if (status) query.status = status;

    if (domain) {
      query.$or = [
        { track: domain },
        { role: domain },
      ];
    }

    if (search) {
      const escaped = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const expression = new RegExp(escaped, "i");
      const searchConditions = [
        { name: expression },
        { email: expression },
        { phone: expression },
      ];

      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions },
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    const candidates = await Candidate.find(query).sort({
      createdAt: -1,
    });

    const allCandidates = await Candidate.find(
      {},
      { track: 1, role: 1 },
    ).lean();

    const domains = [
      ...new Set([
        ...INTERNSHIP_DOMAINS,
        ...allCandidates
          .map((candidate) => candidate.track || candidate.role)
          .filter(Boolean),
      ]),
    ];

    return res.json({
      success: true,
      candidates,
      data: candidates,
      domains,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const status = String(req.body?.status || "")
      .trim()
      .toLowerCase();

    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be pending, shortlisted or rejected.",
      });
    }

    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate was not found.",
      });
    }

    candidate.status = status;
    await candidate.save();

    return res.json({
      success: true,
      message: `Candidate marked as ${status}.`,
      candidate,
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate was not found.",
      });
    }

    if (candidate.status !== "rejected") {
      return res.status(409).json({
        success: false,
        message:
          "Only a rejected candidate can be permanently deleted.",
      });
    }

    await candidate.deleteOne();

    return res.json({
      success: true,
      message: "Rejected candidate deleted permanently.",
    });
  } catch (error) {
    next(error);
  }
};


// Serves resumes that were stored in MongoDB (Cloudinary fallback path).
export const downloadResume = async (req, res, next) => {
  try {
    const Candidate = (await import("./candidate.model.js")).default;
    const candidate = await Candidate.findById(req.params.id).select(
      "+resumeData resumeMimeType resumeOriginalName resumeUrl resumeStorage",
    );

    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    if (candidate.resumeStorage === "cloudinary" && candidate.resumeUrl) {
      return res.redirect(candidate.resumeUrl);
    }

    if (!candidate.resumeData?.length) {
      return res
        .status(404)
        .json({ success: false, message: "No resume stored for this application." });
    }

    res.setHeader(
      "Content-Type",
      candidate.resumeMimeType || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${(candidate.resumeOriginalName || "resume").replace(/"/g, "")}"`,
    );
    return res.send(candidate.resumeData);
  } catch (error) {
    return next(error);
  }
};
