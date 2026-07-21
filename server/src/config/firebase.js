import admin from "firebase-admin";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authProjectId =
  process.env.FIREBASE_AUTH_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  "";

const serviceAccountCandidates = [
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  path.resolve(__dirname, "../../serviceAccountKey.json"),
  path.resolve(process.cwd(), "serviceAccountKey.json"),
  path.resolve(process.cwd(), "server/serviceAccountKey.json"),
].filter(Boolean);

let firebaseReady = getApps().length > 0;
let initializationError = null;

// Local/dev compatibility: initialize from a service-account JSON file when present.
if (!firebaseReady) {
  for (const filename of [...new Set(serviceAccountCandidates)]) {
    try {
      if (!fs.existsSync(filename)) continue;

      const raw = fs.readFileSync(filename, "utf8").replace(/^\uFEFF/, "");
      const serviceAccount = JSON.parse(raw);

      if (typeof serviceAccount.private_key === "string") {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }

      initializeApp({
        credential: cert(serviceAccount),
        projectId: authProjectId || serviceAccount.project_id,
      });

      firebaseReady = true;
      console.log(
        `Firebase Admin initialized using ${filename} (auth project: ${
          authProjectId || serviceAccount.project_id
        })`,
      );
      break;
    } catch (error) {
      initializationError = error;
    }
  }
}

// Production/Render compatibility: no serviceAccountKey.json is required.
if (!firebaseReady) {
  try {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.FIREBASE_AUTH_PROJECT_ID ||
      "";

    const clientEmail =
      process.env.FIREBASE_CLIENT_EMAIL ||
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
      "";

    const privateKey = String(
      process.env.FIREBASE_PRIVATE_KEY ||
        process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
        "",
    ).replace(/\\n/g, "\n");

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });

      firebaseReady = true;
      console.log(
        `Firebase Admin initialized using environment credentials (auth project: ${projectId})`,
      );
    }
  } catch (error) {
    initializationError = error;
  }
}

if (!firebaseReady) {
  const detail =
    initializationError?.message ||
    "no readable Admin SDK service-account key or complete Firebase environment credentials were found";
  console.warn(`Firebase Admin initialization skipped: ${detail}`);
}

export { firebaseReady, authProjectId };
export default admin;
