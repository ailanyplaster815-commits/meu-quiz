// Firebase core
import { initializeApp, getApps, getApp } from "firebase/app";

// Firestore (banco de dados)
import { getFirestore } from "firebase/firestore";

// Analytics (somente no client)
import { getAnalytics, isSupported } from "firebase/analytics";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

// Config do Firebase (vem do painel)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

// Evita recriar app no hot reload do Next.js
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Provider Google
export const googleProvider = new GoogleAuthProvider();

// 🔥 Firestore (principal do seu SaaS)
export const db = getFirestore(app);

// 📊 Analytics (só funciona no browser)
export const initAnalytics = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return getAnalytics(app);
    }
  }
  return null;
};

// export padrão (opcional, mas ajuda em alguns casos)
export default app;