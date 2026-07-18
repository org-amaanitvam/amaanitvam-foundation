const LIST_ENDPOINT_PREFIXES = [
  "/admin/candidates",
  "/admin/members",
  "/admin/users",
  "/admin/departments",
  "/public/departments",
  "/admin/donations",
  "/admin/certificates",
  "/admin/gallery",
  "/admin/cms",
  "/admin/learning-hub",
  "/learning-hub",
  "/admin/reports",
  "/admin/notifications",
  "/admin/contact",
  "/contact",
];

const ARRAY_KEYS = [
  "data",
  "items",
  "results",
  "records",
  "docs",
  "documents",
  "candidates",
  "members",
  "users",
  "departments",
  "donations",
  "certificates",
  "gallery",
  "media",
  "images",
  "albums",
  "cms",
  "pages",
  "posts",
  "courses",
  "books",
  "library",
  "reports",
  "notifications",
  "messages",
  "contacts",
];

function shouldNormalize(req) {
  if (req.method !== "GET") return false;

  const path = req.path || req.originalUrl || "";

  return LIST_ENDPOINT_PREFIXES.some((prefix) => {
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

function findArray(value, depth = 0) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object" || depth > 3) return null;

  for (const key of ARRAY_KEYS) {
    if (Array.isArray(value[key])) return value[key];
  }

  for (const key of ARRAY_KEYS) {
    const nested = findArray(value[key], depth + 1);
    if (Array.isArray(nested)) return nested;
  }

  return null;
}

export default function adminApiShapeNormalizer(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (shouldNormalize(req)) {
      const array = findArray(body);

      if (Array.isArray(array)) {
        return originalJson(array);
      }

      if (body && typeof body === "object" && body.success === true) {
        return originalJson([]);
      }
    }

    return originalJson(body);
  };

  next();
}
