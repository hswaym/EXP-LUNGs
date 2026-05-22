import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

let firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-project-id.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

if (typeof window !== "undefined") {
  const storedFb = localStorage.getItem("EXPLUNG_FIREBASE_CONFIG");
  if (storedFb) {
    try {
      const parsed = JSON.parse(storedFb);
      if (parsed.apiKey && parsed.projectId) {
        firebaseConfig = {
          apiKey: parsed.apiKey,
          authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
          projectId: parsed.projectId,
          storageBucket: parsed.storageBucket || `${parsed.projectId}.appspot.com`,
          messagingSenderId: parsed.messagingSenderId || "123456789",
          appId: parsed.appId || "1:123456789:web:abcdef",
          measurementId: parsed.measurementId
        };
      }
    } catch (e) {
      console.warn("[Firebase Init] Failed to parse EXPLUNG_FIREBASE_CONFIG from localStorage:", e);
    }
  }
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Analytics if supported in the client browser
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("[Firebase Init] Analytics initialization skipped or unsupported:", err);
  });
}

export { analytics };
export default app;

