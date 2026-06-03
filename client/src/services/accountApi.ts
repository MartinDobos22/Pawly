import { getAuthHeader, handleUnauthorized } from './authToken';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function deleteAccount(): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/account`, {
    method: 'DELETE',
    headers: { ...(await getAuthHeader()) },
  });
  if (!res.ok) {
    await handleUnauthorized(res.status, res);
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }
}

export async function exportUserData(): Promise<Blob> {
  const res = await fetch(`${BASE_URL}/api/account/export`, {
    method: 'GET',
    headers: { ...(await getAuthHeader()) },
  });
  if (!res.ok) {
    await handleUnauthorized(res.status, res);
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }
  return res.blob();
}

export interface AuditLogEntry {
  id: number;
  action: 'list' | 'create' | 'update' | 'delete' | 'export';
  table_name: string;
  record_id: string | null;
  pet_id: string | null;
  created_at: string;
}

export async function fetchAuditLog(limit = 200): Promise<AuditLogEntry[]> {
  const res = await fetch(`${BASE_URL}/api/account/audit-log?limit=${limit}`, {
    method: 'GET',
    headers: { ...(await getAuthHeader()) },
  });
  if (!res.ok) {
    await handleUnauthorized(res.status, res);
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }
  const data = (await res.json()) as { entries?: AuditLogEntry[] };
  return data.entries ?? [];
}
