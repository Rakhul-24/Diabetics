import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB3AmNB3YMYXWRlRCpRhd4zE8UhkccFdoA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "diabetics-c67c3.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "diabetics-c67c3",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "diabetics-c67c3.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "658724202427",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:658724202427:web:a7be24658b682dd3db069e",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-1W1S1YKL5Q"
};

// Initialize Firebase App instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, googleProvider, signInWithPopup, signOut };
