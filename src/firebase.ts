// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Check if Firebase config is valid
const isFirebaseConfigValid = Object.values(firebaseConfig).every(value => value && value.length > 0);

if (!isFirebaseConfigValid) {
  console.warn('Firebase configuration is incomplete. Some features may not work.');
}

// Initialize Firebase
let app;
let auth;
let googleProvider;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Initialize Analytics (with error handling)
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

export { auth, googleProvider, analytics };
export default app;
