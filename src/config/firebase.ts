import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Configuration Firebase TontinePro
const firebaseConfig = {
  apiKey: "AIzaSyD9RyHUX_SSO5OklxjZgzy9rQ0U2peXQJA",
  authDomain: "tontine-pro-31a45.firebaseapp.com",
  projectId: "tontine-pro-31a45",
  storageBucket: "tontine-pro-31a45.firebasestorage.app",
  messagingSenderId: "628266525462",
  appId: "1:628266525462:web:655faa13e5912a15f72637",
  measurementId: "G-RP80DEBZH3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (optionnel)
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

export default app;