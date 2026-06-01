import { auth } from '../config/firebase';
import { logger } from '../utils/logger';

function decodeJwtClaims(token: string): { aud?: string; iss?: string; exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      aud?: string;
      iss?: string;
      exp?: number;
    };
    return { aud: json.aud, iss: json.iss, exp: json.exp };
  } catch {
    return null;
  }
}

export async function getAuthHeader(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    logger.warn('getAuthHeader: žiadny prihlásený používateľ → request bez tokenu');
    return {};
  }
  const token = await currentUser.getIdToken();
  const claims = decodeJwtClaims(token);
  logger.info('getAuthHeader: pripájam token', {
    uid: currentUser.uid,
    tokenLen: token.length,
    audProjectId: claims?.aud,
    expiresAt: claims?.exp ? new Date(claims.exp * 1000).toISOString() : undefined,
  });
  return { Authorization: `Bearer ${token}` };
}

// 401 = bad/missing token → signOut.
// 403 EMAIL_NOT_VERIFIED a iné kódy NEROBÍME hard navigation (window.location.assign)
// — to spôsobovalo bounce loop: full page reload → Firebase SDK načíta cached starý token
// z IndexedDB → backend opäť 403 → reload → loop.
// ProtectedRoute sám redirectuje cez React Router neverifikovaných userov na /overenie-emailu
// na základe user.emailVerified state. Stačí to.
export async function handleUnauthorized(status: number, _res?: Response): Promise<void> {
  if (status === 401) {
    logger.warn('handleUnauthorized: 401 → odhlasujem používateľa (auth.signOut)');
    await auth.signOut();
    return;
  }
  if (status === 403) {
    logger.warn(
      'handleUnauthorized: 403 — backend zamietol request (napr. EMAIL_NOT_VERIFIED). ' +
        'Redirect ponecháme na ProtectedRoute aby sme predišli reload loop.'
    );
  }
}
