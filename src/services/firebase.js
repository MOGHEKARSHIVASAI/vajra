import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;
const googleProvider = new GoogleAuthProvider();

const isConfigValid = firebaseConfig.apiKey && 
                     firebaseConfig.apiKey !== 'your_api_key' && 
                     firebaseConfig.apiKey !== '';

if (isConfigValid) {
  try {
    console.log("[Firebase] Initializing services...");
    
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    
    // Set persistent session
    setPersistence(auth, browserLocalPersistence)
      .then(() => console.log("[Firebase] Persistence set to LOCAL"))
      .catch((err) => console.error("[Firebase] Persistence Error:", err));
    
    try {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch (e) {
      db = getFirestore(app);
    }

    storage = getStorage(app);
    analytics = getAnalytics(app);
    console.log("[Firebase] Services initialized successfully");
  } catch (error) {
    console.error("[Firebase] Initialization Error:", error);
  }
} else {
  console.warn("[Firebase] configuration is missing or invalid. Check your .env file.");
}

export { auth, db, storage, analytics, googleProvider };
export default app;
