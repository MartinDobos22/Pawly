import { getAuthHeader, handleUnauthorized } from './authToken';
import { logger } from '../utils/logger';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export interface NotificationPreferences {
  emailEnabled: boolean;
  leadDays: number[];
  notifyVaccinations: boolean;
  notifyDewormings: boolean;
  notifyEctoparasites: boolean;
  notifyVetChecks: boolean;
  notifyMedications: boolean;
}

export type NotificationRecordType =
  | 'VACCINATION'
  | 'DEWORMING'
  | 'ECTOPARASITE'
  | 'VET_CHECK'
  | 'MEDICATION';

export interface UpcomingItem {
  recordId: string;
  type: NotificationRecordType;
  typeLabel: string;
  petId: string;
  petName: string;
  label: string;
  dueDate: string;
  daysUntil: number;
  status: 'OVERDUE' | 'DUE_SOON' | 'OK';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}/api/notifications${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    await handleUnauthorized(res.status, res);
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    logger.error('Notifications API zlyhalo', { url, status: res.status });
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const notificationsApi = {
  getPreferences: () => request<NotificationPreferences>('/preferences'),
  updatePreferences: (patch: Partial<NotificationPreferences>) =>
    request<NotificationPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(patch),
    }),
  getUpcoming: (petId?: string) =>
    request<{ items: UpcomingItem[] }>(
      petId ? `/upcoming?petId=${encodeURIComponent(petId)}` : '/upcoming'
    ),
};
