import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { logger } from '../utils/logger';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

logger.info('Štart aplikácie — runtime konfigurácia', {
  apiBaseUrl: import.meta.env.VITE_API_URL ?? '(prázdne → relatívne / Vite proxy)',
  firebaseProjectId: firebaseConfig.projectId,
  firebaseAuthDomain: firebaseConfig.authDomain,
  hasFirebaseApiKey: Boolean(firebaseConfig.apiKey),
  hasFirebaseAppId: Boolean(firebaseConfig.appId),
  mode: import.meta.env.MODE,
});

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
