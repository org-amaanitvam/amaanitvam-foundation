import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

// Every dashboard user reaches the API through the gateway, so all traffic
// shares ONE source IP. Key on the authenticated user when we have one,
// and never throttle local development.
const keyByUser = (req) =>
  req.user?.uid ||
  req.headers.authorization?.slice(-32) ||
  req.ip;

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX || (isProduction ? 1200 : 100000)),
  keyGenerator: keyByUser,
  skip: () => !isProduction && process.env.ENABLE_DEV_RATE_LIMIT !== "true",
  message: "Too many requests, please try again in a few minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || (isProduction ? 60 : 1000)),
  keyGenerator: keyByUser,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
