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

function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  // odstráň prípadnú koncovú čiarku (copy z JSON riadku: "...",)
  if (key.endsWith(',')) key = key.slice(0, -1).trim();
  // Render/dashboardy nestripujú úvodzovky — odstráň obaľujúce " alebo '
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  // literálne \n (z JSON-u / single-line env) → reálne nové riadky
  key = key.replace(/\\n/g, '\n').trim();
  return key;
}

function initApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  return initializeApp({
    credential: cert({
      projectId: requireEnv('FIREBASE_PROJECT_ID'),
      clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: normalizePrivateKey(requireEnv('FIREBASE_PRIVATE_KEY')),
    }),
  });
}

export function getAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAdminAuth(initApp());
  }
  return cachedAuth;
}
