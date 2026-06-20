import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { logger } from '../utils/logger';

const isBrowser = typeof window !== 'undefined';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase sa inicializuje len v prehliadači. Pri build-time prerenderi (SSG cez
// react-dom/server v Node) by getAuth/GoogleAuthProvider pristúpili k browser API
// a build by spadol. Auth funkcie v AuthContext bežia výhradne v effectoch/callbackoch
// (teda len v prehliadači), takže SSR tieto exporty nikdy nepoužije.
let authInstance: Auth;
let googleProviderInstance: GoogleAuthProvider;

if (isBrowser) {
  logger.info('Štart aplikácie — runtime konfigurácia', {
    apiBaseUrl: import.meta.env.VITE_API_URL ?? '(prázdne → relatívne / Vite proxy)',
    firebaseProjectId: firebaseConfig.projectId,
    firebaseAuthDomain: firebaseConfig.authDomain,
    hasFirebaseApiKey: Boolean(firebaseConfig.apiKey),
    hasFirebaseAppId: Boolean(firebaseConfig.appId),
    mode: import.meta.env.MODE,
  });

  const app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  googleProviderInstance = new GoogleAuthProvider();
} else {
  authInstance = undefined as unknown as Auth;
  googleProviderInstance = undefined as unknown as GoogleAuthProvider;
}

export const auth = authInstance;
export const googleProvider = googleProviderInstance;
