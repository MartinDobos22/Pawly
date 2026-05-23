import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getAuth as getAdminAuth, type Auth } from 'firebase-admin/auth';

let cachedAuth: Auth | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Chýbajúca povinná Firebase premenná prostredia: ${name}. Pozri server/.env.example.`
    );
  }
  return value;
}

function initApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  return initializeApp({
    credential: cert({
      projectId: requireEnv('FIREBASE_PROJECT_ID'),
      clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
  });
}

export function getAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAdminAuth(initApp());
  }
  return cachedAuth;
}
