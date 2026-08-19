import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // apiKey: "AIzaSyCpjgB4YQB95OTqARnvoVUt2Xq27eoBATc",
  // authDomain: "amaanitvam-admin-portal.firebaseapp.com",
  // projectId: "amaanitvam-admin-portal",
  // storageBucket: "amaanitvam-admin-portal.firebasestorage.app",
  // messagingSenderId: "365203992524",
  // appId: "1:365203992524:web:63f5f8e5b226d52d31f769",
  // measurementId: "G-Q449TR3H4R"
  apiKey: "AIzaSyDfpFJ65XBWekwaeUKK6Qc4kI5GPN9Vylw",
  authDomain: "skb-world.firebaseapp.com",
  projectId: "skb-world",
  storageBucket: "skb-world.firebasestorage.app",
  messagingSenderId: "437058674070",
  appId: "1:437058674070:web:584a33eec4e09787f951b7",
  measurementId: "G-CQFD35QWNE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;