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

export async function handleUnauthorized(status: number): Promise<void> {
  if (status === 401) {
    logger.warn('handleUnauthorized: 401 → odhlasujem používateľa (auth.signOut)');
    await auth.signOut();
  }
}
