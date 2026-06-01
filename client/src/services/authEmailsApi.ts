import { getAuthHeader, handleUnauthorized } from './authToken';
import { logger } from '../utils/logger';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export type EmailLocale = 'sk' | 'en';

export async function requestVerificationEmail(locale: EmailLocale): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/auth/send-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
    },
    body: JSON.stringify({ locale }),
  });

  if (!res.ok) {
    await handleUnauthorized(res.status, res);
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string; code?: string } | string;
    } | null;
    const message =
      typeof body?.error === 'string'
        ? body.error
        : (body?.error?.message ?? `Chyba servera (${res.status})`);
    const code = typeof body?.error === 'object' ? body?.error?.code : undefined;
    logger.warn('requestVerificationEmail zlyhalo', { status: res.status, code });
    throw new Error(message);
  }
}
