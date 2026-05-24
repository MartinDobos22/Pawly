import { getAuthHeader, handleUnauthorized } from './authToken';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function deleteAccount(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/account`, {
    method: 'DELETE',
    headers: { ...(await getAuthHeader()) },
  });
  if (!res.ok) {
    await handleUnauthorized(res.status);
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }
}
