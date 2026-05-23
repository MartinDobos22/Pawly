import type { PetProfile } from '../types';
import { getAuthHeader, handleUnauthorized } from './authToken';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/pets${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    await handleUnauthorized(res.status);
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message ?? `Chyba servera (${res.status})`);
  }

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
