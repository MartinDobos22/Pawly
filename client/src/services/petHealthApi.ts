import type {
  DewormingRecord,
  DietEntry,
  EctoparasiteRecord,
  ExpenseRecord,
  MedicationDoseLog,
  MedicationRecord,
  VaccinationRecord,
  VetVisitRecord,
} from '../types/petHealth';
import type { PetProfile } from '../types';
import { getAuthHeader, handleUnauthorized } from './authToken';

const BASE_URL = '/api/v1';

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeader()),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!response.ok) {
    await handleUnauthorized(response.status, response);
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const petHealthApi = {
  createPet: (payload: Partial<PetProfile>) =>
    call<PetProfile>('/pets', { method: 'POST', body: JSON.stringify(payload) }),
  getPet: (petId: string) => call<PetProfile>(`/pets/${petId}`),
  updatePet: (petId: string, payload: Partial<PetProfile>) =>
    call<PetProfile>(`/pets/${petId}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  createVaccination: (petId: string, payload: Omit<VaccinationRecord, 'id' | 'petId'>) =>
    call<VaccinationRecord>(`/pets/${petId}/vaccinations`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listVaccinations: (petId: string) => call<VaccinationRecord[]>(`/pets/${petId}/vaccinations`),
  updateVaccination: (petId: string, id: string, payload: Partial<VaccinationRecord>) =>
    call<VaccinationRecord>(`/pets/${petId}/vaccinations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  createDeworming: (
    petId: string,
    payload: Omit<DewormingRecord, 'id' | 'petId' | 'nextDueDate'>
  ) =>
    call<DewormingRecord>(`/pets/${petId}/dewormings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listDewormings: (petId: string) => call<DewormingRecord[]>(`/pets/${petId}/dewormings`),

  createEctoparasite: (
    petId: string,
    payload: Omit<EctoparasiteRecord, 'id' | 'petId' | 'nextDueDate'>
  ) =>
    call<EctoparasiteRecord>(`/pets/${petId}/ectoparasites`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listEctoparasites: (petId: string) => call<EctoparasiteRecord[]>(`/pets/${petId}/ectoparasites`),

  createVetVisit: (
    petId: string,
    payload: Omit<VetVisitRecord, 'id' | 'petId' | 'medicationIds'>
  ) =>
    call<VetVisitRecord>(`/pets/${petId}/vet-visits`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listVetVisits: (petId: string) => call<VetVisitRecord[]>(`/pets/${petId}/vet-visits`),

  createMedication: (petId: string, payload: Omit<MedicationRecord, 'id' | 'petId'>) =>
    call<MedicationRecord>(`/pets/${petId}/medications`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logDose: (
    petId: string,
    medicationId: string,
    payload: Omit<MedicationDoseLog, 'id' | 'petId' | 'medicationId'>
  ) =>
    call<MedicationDoseLog>(`/pets/${petId}/medications/${medicationId}/dose-logs`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  createDietEntry: (petId: string, payload: Omit<DietEntry, 'id' | 'petId'>) =>
    call<DietEntry>(`/pets/${petId}/diet-entries`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listDietEntries: (petId: string) => call<DietEntry[]>(`/pets/${petId}/diet-entries`),

  createExpense: (petId: string, payload: Omit<ExpenseRecord, 'id' | 'petId'>) =>
    call<ExpenseRecord>(`/pets/${petId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  listExpenses: (petId: string) => call<ExpenseRecord[]>(`/pets/${petId}/expenses`),

  getVetCard: (petId: string) => call(`/pets/${petId}/vet-card`),
  getSemaphores: (petId: string) => call(`/pets/${petId}/semaphores`),
  getTimeline: (petId: string) => call(`/pets/${petId}/timeline`),
};
