import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
// ⚠️ Bu bilgiler .env dosyasından gelecek
const firebaseConfig = {
  apiKey: "AIzaSyD9ttNuAkxDDYSgdgE8OXu7ap1Ikym-Dps",
  authDomain: "maketled.firebaseapp.com",
  projectId: "maketled",
  storageBucket: "maketled.firebasestorage.app",
  messagingSenderId: "960232710140",
  appId: "1:960232710140:web:a61cafc2651c3d4fb6dc79",
  measurementId: "G-3X2QJXDRF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Use emulators in development (disabled - using production Firebase)
// if (import.meta.env.DEV) {
//   console.log('🔧 Using Firebase Emulators');
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export default app;
