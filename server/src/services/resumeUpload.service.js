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

export const uploadApplicationResume = async (file, applicationType) => {
  if (!file?.buffer?.length) {
    const error = new Error("A resume file is required.");
    error.statusCode = 400;
    throw error;
  }

  if (!cloudinaryConfigured()) {
    const error = new Error(
      "Resume storage is not configured. Add the Cloudinary environment variables.",
    );
    error.statusCode = 503;
    throw error;
  }

  const extension = path.extname(file.originalname || "").toLowerCase();
  const publicId = [
    applicationType || "application",
    Date.now(),
    safeName(file.originalname),
  ].join("-");

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
      (error, uploaded) => {
        if (error) return reject(error);
        resolve(uploaded);
      },
    );

    stream.end(file.buffer);
  });

  return {
    url: result.secure_url || result.url,
    publicId: result.public_id || "",
  };
};
