import { verifyFirebaseIdToken } from "../config/firebaseTokenVerifier.js";
import { UnauthorizedError } from "../shared/errors/AppError.js";

export const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.slice(7).trim();

    try {
      req.user = await verifyFirebaseIdToken(token);
    } catch (error) {
      console.error("[AUTH] Firebase token rejected:", {
        code: error?.code || "unknown",
        message: error?.message || "Unknown Firebase verification error",
      });
      throw new UnauthorizedError("Invalid or expired token");
    }

    next();
  } catch (error) {
    next(error);
  }
};
