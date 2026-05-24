import type {
  DewormingRecord,
  DietEntry,
  EctoparasiteRecord,
  ExpenseRecord,
  MedicationDoseLog,
  MedicationRecord,
  VaccinationRecord,
  VetVisitRecord,
  WeightLog,
} from '../types/dogHealth';
import type { HealthEpisodeRecord } from '../types/healthEpisode';
import type { SavedAnalysis } from '../types';
import type { VisitBundle } from '../utils/vetVisitHelper';
import { getAuthHeader, handleUnauthorized } from './authToken';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/health${path}`, {
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

export interface CrudApi<T> {
  list: () => Promise<T[]>;
  create: (payload: Partial<T>) => Promise<T>;
  update: (id: string, payload: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

function crudApi<T>(path: string): CrudApi<T> {
  return {
    list: () => request<T[]>(`/${path}`),
    create: (payload) => request<T>(`/${path}`, { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request<T>(`/${path}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    remove: (id) => request<void>(`/${path}/${id}`, { method: 'DELETE' }),
  };
}

export const vaccinationsApi = crudApi<VaccinationRecord>('vaccinations');
export const dewormingsApi = crudApi<DewormingRecord>('dewormings');
export const ectoparasitesApi = crudApi<EctoparasiteRecord>('ectoparasites');
export const vetVisitsApi = crudApi<VetVisitRecord>('vet-visits');
export const medicationsApi = crudApi<MedicationRecord>('medications');
export const doseLogsApi = crudApi<MedicationDoseLog>('dose-logs');
export const dietEntriesApi = crudApi<DietEntry>('diet-entries');
export const expensesApi = crudApi<ExpenseRecord>('expenses');
export const episodesApi = crudApi<HealthEpisodeRecord>('episodes');
export const weightLogsApi = crudApi<WeightLog>('weight-logs');

export function createVisitBundle(bundle: VisitBundle): Promise<VisitBundle> {
  return request<VisitBundle>('/visit-bundle', { method: 'POST', body: JSON.stringify(bundle) });
}

export const savedAnalysesApi = {
  list: () => request<SavedAnalysis[]>('/saved-analyses'),
  create: (payload: Partial<SavedAnalysis>) =>
    request<SavedAnalysis>('/saved-analyses', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/saved-analyses/${id}`, { method: 'DELETE' }),
  clear: () => request<void>('/saved-analyses', { method: 'DELETE' }),
};
