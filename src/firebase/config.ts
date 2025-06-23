import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo1JcC7fETknewwFkG6orZYUVPlDSCLFI",
  authDomain: "cleaning-tracker-54e8a.firebaseapp.com",
  projectId: "cleaning-tracker-54e8a",
  storageBucket: "cleaning-tracker-54e8a.firebasestorage.app",
  messagingSenderId: "866545309174",
  appId: "1:866545309174:web:04ac28d89aa9e65bc123d7",
  measurementId: "G-T0EVRX7G2Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Connect to emulators when using emulator script
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Connected to Firebase Emulators');
  } catch (error) {
    console.log('Emulators already connected or error:', error);
  }
}

export default app;