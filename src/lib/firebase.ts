import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const isProduction = process.env.NODE_ENV === 'production';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

// Production Safety Guard
if (isProduction) {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Production Deployment Error: Missing required Firebase environment variables: ${missingKeys.join(', ')}`);
  }
} else {
  // Safe Mock Fallbacks strictly for local development/testing only
  firebaseConfig.apiKey = firebaseConfig.apiKey || "mock-api-key-for-local-testing-only-123456";
  firebaseConfig.authDomain = firebaseConfig.authDomain || "mock-app.firebaseapp.com";
  firebaseConfig.projectId = firebaseConfig.projectId || "mock-app-id";
  firebaseConfig.storageBucket = firebaseConfig.storageBucket || "mock-app.appspot.com";
  firebaseConfig.messagingSenderId = firebaseConfig.messagingSenderId || "1234567890";
}

const isFirebaseConfigValid = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId
);

const app: FirebaseApp | null = isFirebaseConfigValid
  ? !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp()
  : null;

if (!app) {
  console.warn('Firebase is not configured. Running in local UI-only mode without Firebase auth or Firestore.');
}

// For build-time typing we export `db` as a Firestore instance. At runtime
// `app` may be null when Firebase isn't configured; in that case we provide
// a minimal cast to satisfy TypeScript while keeping runtime behavior safe.
const db: Firestore = app ? getFirestore(app) as Firestore : (null as unknown as Firestore);
const auth: Auth = app ? getAuth(app) as Auth : ({} as Auth);
const firebaseAvailable = Boolean(app);

export { db, auth, firebaseAvailable, firebaseConfig };