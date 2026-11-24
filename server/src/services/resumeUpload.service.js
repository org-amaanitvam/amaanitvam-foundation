import path from "node:path";
import cloudinary from "../config/cloudinary.js";

const safeName = (value) =>
  String(value || "resume")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "resume";

const cloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );

/**
 * Uploads a public application resume.
 *
 * Cloudinary is used when it is fully configured and reachable. When it is not
 * (missing env vars on the host, bad credentials, network failure) we DO NOT
 * fail the application: the file is kept in MongoDB by the caller and served
 * back through /api/candidates/:id/resume.
 */
export const uploadApplicationResume = async (file, applicationType) => {
  if (!file?.buffer?.length) {
    const error = new Error("A resume file is required.");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const fallback = {
    url: "",
    publicId: "",
    storage: "mongodb",
    buffer: file.buffer,
    mimeType: file.mimetype || "application/octet-stream",
    originalName: file.originalname || "resume",
  };

  if (!cloudinaryConfigured()) {
    console.warn(
      "[resumeUpload] Cloudinary env vars are missing — storing resume in MongoDB instead.",
    );
    return fallback;
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  const publicId = [
    applicationType || "application",
    Date.now(),
    safeName(file.originalname),
  ].join("-");

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "amaanitvam/applications/resumes",
          public_id: publicId,
          resource_type: "raw",
          type: "upload",
          overwrite: false,
          filename_override: `${safeName(file.originalname)}${extension}`,
        },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      stream.end(file.buffer);
    });

    return {
      url: result.secure_url || result.url || "",
      publicId: result.public_id || "",
      storage: "cloudinary",
      buffer: file.buffer,
      mimeType: file.mimetype || "application/octet-stream",
      originalName: file.originalname || "resume",
    };
  } catch (error) {
    // Log the REAL reason (previously masked as a generic 500) and continue.
    console.error(
      "[resumeUpload] Cloudinary upload failed, falling back to MongoDB:",
      error?.message || error,
    );
    return fallback;
  }
};
