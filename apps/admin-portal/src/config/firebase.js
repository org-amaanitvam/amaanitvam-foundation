import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpjgB4YQB95OTqARnvoVUt2Xq27eoBATc",
  authDomain: "amaanitvam-admin-portal.firebaseapp.com",
  projectId: "amaanitvam-admin-portal",
  storageBucket: "amaanitvam-admin-portal.firebasestorage.app",
  messagingSenderId: "365203992524",
  appId: "1:365203992524:web:63f5f8e5b226d52d31f769",
  measurementId: "G-Q449TR3H4R"
};  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
