import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase web configuration is public by design. Environment values override
// these deployment defaults when present.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCpjgB4YQB95OTqARnvoVUt2Xq27eoBATc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'amaanitvam-admin-portal.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'amaanitvam-admin-portal',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'amaanitvam-admin-portal.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '365203992524',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:365203992524:web:63f5f8e5b226d52d31f769',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Q449TR3H4R',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
