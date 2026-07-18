import admin from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
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
        projectId: serviceAccount.project_id,
      });
      firebaseReady = true;
      console.log(`Firebase Admin initialized using ${filename}`);
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

export { firebaseReady };
export default admin;