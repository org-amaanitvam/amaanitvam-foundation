
import admin from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authProjectId =
  process.env.FIREBASE_AUTH_PROJECT_ID ||
  process.env.FIREBASE_PROJECT_ID ||
  '';

const candidates = [
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  path.resolve(__dirname, '../../serviceAccountKey.json'),
  path.resolve(process.cwd(), 'serviceAccountKey.json'),
  path.resolve(process.cwd(), 'server/serviceAccountKey.json'),
].filter(Boolean);

let firebaseReady = getApps().length > 0;
let initializationError = null;

if (!firebaseReady) {
  for (const filename of [...new Set(candidates)]) {
    try {
      if (!fs.existsSync(filename)) continue;
      const raw = fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, '');
      const serviceAccount = JSON.parse(raw);
      if (typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      initializeApp({
        credential: cert(serviceAccount),
        projectId: authProjectId || serviceAccount.project_id,
      });

      firebaseReady = true;
      console.log(
        `Firebase Admin initialized using ${filename} (auth project: ${authProjectId || serviceAccount.project_id})`,
      );
      break;
    } catch (error) {
      initializationError = error;
    }
  }
}

if (!firebaseReady) {
  const detail = initializationError?.message || 'no readable Admin SDK service-account key was found';
  console.warn(`Firebase Admin initialization skipped: ${detail}`);
}

export { firebaseReady, authProjectId };
export default admin;
