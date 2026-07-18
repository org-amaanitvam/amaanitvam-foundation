import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const AUTH_APP_NAME = "admin-token-verifier";
const AUTH_PROJECT_ID =
  process.env.FIREBASE_AUTH_PROJECT_ID || "amaanitvam-admin-portal";

const verifierApp =
  getApps().find((app) => app.name === AUTH_APP_NAME) ||
  initializeApp(
    {
      projectId: AUTH_PROJECT_ID,
    },
    AUTH_APP_NAME
  );

export async function verifyFirebaseIdToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Firebase ID token is missing");
  }

  return getAuth(verifierApp).verifyIdToken(token);
}

export { AUTH_PROJECT_ID };
