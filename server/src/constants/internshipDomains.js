export const INTERNSHIP_DOMAINS = Object.freeze([
  "FullStack",
  "Frontend",
  "Backend",
  "CSR",
  "Marketing",
  "Management",
  "Content",
  "Social media",
  "Graphics",
  "Fundraising executive",
  "HR",
  "Creative",
]);

export const canonicalInternshipDomain = (value) => {
  const input = String(value || "").trim().toLowerCase();

  return (
    INTERNSHIP_DOMAINS.find(
      (domain) => domain.toLowerCase() === input,
    ) || ""
  );
};
