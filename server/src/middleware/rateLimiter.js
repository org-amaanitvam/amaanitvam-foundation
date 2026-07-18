import rateLimit from "express-rate-limit";

const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isNonProduction = () => process.env.NODE_ENV !== "production";

/**
 * General API protection.
 *
 * Development is excluded because the React/Vite development lifecycle can
 * legitimately issue duplicate requests, and the in-memory limiter otherwise
 * blocks the entire local admin portal.
 *
 * Production remains protected with a substantially safer operational limit.
 */
export const apiLimiter = rateLimit({
  windowMs: positiveInteger(
    process.env.API_RATE_LIMIT_WINDOW_MS,
    15 * 60 * 1000
  ),
  limit: positiveInteger(process.env.API_RATE_LIMIT_MAX, 2000),

  skip: (req) =>
    isNonProduction() ||
    req.method === "OPTIONS" ||
    req.path === "/health" ||
    req.path === "/api/health",

  standardHeaders: true,
  legacyHeaders: false,

  statusCode: 429,
  message: {
    success: false,
    message: "Too many API requests. Please wait briefly and try again.",
    code: "API_RATE_LIMITED",
  },
});

/**
 * Authentication endpoints keep a separate stricter production limit.
 * Local development is excluded so testing a repaired login flow does not
 * lock the developer out for an hour.
 */
export const authLimiter = rateLimit({
  windowMs: positiveInteger(
    process.env.AUTH_RATE_LIMIT_WINDOW_MS,
    60 * 60 * 1000
  ),
  limit: positiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 30),

  skip: (req) => isNonProduction() || req.method === "OPTIONS",

  standardHeaders: true,
  legacyHeaders: false,

  statusCode: 429,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    code: "AUTH_RATE_LIMITED",
  },
});
