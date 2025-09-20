// config/firebase.ts (ou src/firebase.ts selon ton projet)

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// Facultatif : si tu veux activer Google Analytics
import { getAnalytics } from 'firebase/analytics';

// Configuration de ton projet Firebase "tontine-2f124"
const firebaseConfig = {
  apiKey: "AIzaSyBeNv0p3rnVeX5oJ7VCpi36uu1UOHZMTeg",
  authDomain: "tontine-2f124.firebaseapp.com",
  projectId: "tontine-2f124",
  storageBucket: "tontine-2f124.appspot.com", // ⚠️ attention ici
  messagingSenderId: "187612015068",
  appId: "1:187612015068:web:2af122aee7e1c8314a4719",
  measurementId: "G-QV2VJTJX9G"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// (Optionnel) Initialisation de Google Analytics
getAnalytics(app);

export default app;
