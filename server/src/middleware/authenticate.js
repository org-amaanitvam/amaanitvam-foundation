import { getAuth } from "firebase-admin/auth";
import { firebaseReady } from "../config/firebase.js";
import { UnauthorizedError } from "../shared/errors/AppError.js";
import User from "../modules/users/user.model.js";

export const authenticate = async (req, _res, next) => {
  try {
    if (!firebaseReady) {
      throw new UnauthorizedError("Firebase Admin is not configured");
    }
    // Log incoming authorization headers for debugging (temporary)
    // Some proxies/platforms may move or strip Authorization; check common fallbacks.
    const incomingAuth =
      req.headers.authorization ||
      (req.get && req.get("authorization")) ||
      req.headers["x-forwarded-authorization"] ||
      (req.get && req.get("x-forwarded-authorization"));
    console.log("[authenticate] incoming authorization header present:", !!incomingAuth);

    const authHeader = incomingAuth;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided", "AUTH_TOKEN_INVALID");
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (err) {
      // Surface the real reason - "Invalid or expired token" on its own made
      // this impossible to diagnose (expired vs. clock skew vs. wrong project).
      console.error(
        "[authenticate] verifyIdToken failed:",
        err?.code || "unknown",
        "-",
        err?.message,
      );
      throw new UnauthorizedError(
        err?.code === "auth/id-token-expired"
          ? "Session expired, please sign in again"
          : "Invalid or expired token",
        "AUTH_TOKEN_INVALID",
      );
    }

    if (!decodedToken.uid) {
      throw new UnauthorizedError("Invalid token payload", "AUTH_TOKEN_INVALID");
    }

    const user = await User.findOne({ firebase_uid: decodedToken.uid });
    if (!user) {
      throw new UnauthorizedError("User not found", "USER_NOT_FOUND");
    }

    if (user.status !== "active") {
      throw new UnauthorizedError("Account is inactive or suspended");
    }

    req.user = {
      id: user.id,
      role: user.role,
      uid: decodedToken.uid,
      firebase_uid: decodedToken.uid,
      firebaseUid: decodedToken.uid,
      email: user.email,
      email_verified: user.email_verified === true,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};