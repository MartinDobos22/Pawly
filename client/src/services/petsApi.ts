import type { PetProfile } from '../types';
import { getAuthHeader, handleUnauthorized } from './authToken';
import { logger } from '../utils/logger';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? 'GET';
  const url = `${BASE_URL}/api/pets${path}`;
  logger.info('API request', { method, url });
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
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string; code?: string };
    } | null;
    logger.error('API request zlyhal', {
      method,
      url,
      status: res.status,
      code: body?.error?.code,
      message: body?.error?.message,
    });
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }

  logger.info('API response OK', { method, url, status: res.status });
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function listPets(): Promise<PetProfile[]> {
  return request<PetProfile[]>('');
}

export function createPet(payload: Partial<PetProfile>): Promise<PetProfile> {
  return request<PetProfile>('', { method: 'POST', body: JSON.stringify(payload) });
}

export function updatePet(id: string, payload: Partial<PetProfile>): Promise<PetProfile> {
  return request<PetProfile>(`/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export function deletePet(id: string): Promise<void> {
  return request<void>(`/${id}`, { method: 'DELETE' });
}

export function uploadPetPhoto(payload: {
  mimeType: string;
  base64Data: string;
}): Promise<{ url: string; objectPath: string }> {
  return request<{ url: string; objectPath: string }>('/photo', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
