import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const isFirebaseConfigValid = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);

const app: FirebaseApp | null = isFirebaseConfigValid
    ? !getApps().length
        ? initializeApp(firebaseConfig)
        : getApp()
    : null;

if (!app) {
    console.warn('Firebase is not configured. Running in local UI-only mode without Firebase auth or Firestore.');
}

const db: Firestore | null = app ? getFirestore(app) : null;
const auth: Auth = app ? getAuth(app) : ({ currentUser: null } as Auth);
const firebaseAvailable = Boolean(app);

export { db, auth, firebaseAvailable };