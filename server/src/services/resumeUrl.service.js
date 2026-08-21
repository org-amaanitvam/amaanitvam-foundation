/**
 * When the resume was stored in MongoDB (Cloudinary unavailable) the public
 * download URL can only be built after the document exists, because it embeds
 * the candidate id. Called right after Candidate.create().
 */
export const ensureResumeUrl = async (candidate) => {
  if (!candidate || candidate.resumeUrl) return candidate;
  candidate.resumeUrl = `/api/candidates/${candidate._id}/resume`;
  await candidate.save({ validateBeforeSave: false });
  return candidate;
};
