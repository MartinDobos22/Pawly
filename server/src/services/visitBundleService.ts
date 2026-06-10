import { getSupabase } from '../config/supabase';
import { httpError } from '../utils/httpError';
import { assertPetOwned } from './petOwnership';
import {
  dewormingMapper,
  dietEntryMapper,
  doseLogMapper,
  ectoparasiteMapper,
  expenseMapper,
  medicationMapper,
  vaccinationMapper,
  vetVisitMapper,
} from './healthMappers';
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

type Row = Record<string, unknown>;

export interface VisitBundle {
  visit: VetVisitRecord;
  vaccinations: VaccinationRecord[];
  dewormings: DewormingRecord[];
  ectos: EctoparasiteRecord[];
  medications: MedicationRecord[];
  doseLogs: MedicationDoseLog[];
  dietEntries: DietEntry[];
  expenses: ExpenseRecord[];
}

async function insertMany(table: string, rows: Row[]): Promise<Row[]> {
  if (rows.length === 0) return [];
  const { data, error } = await getSupabase().from(table).insert(rows).select('*');
  if (error) throw error;
  return data as Row[];
}

// Pozn.: sekvenčné inserty (nie plne atomické). Pri zlyhaní v strede vráti 5xx;
// budúce vylepšenie je obaliť do plpgsql RPC transakcie.
function isInvalidRange(start: string | undefined, end: string | undefined): boolean {
  if (!start?.trim() || !end?.trim()) return false;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return false;
  return e < s;
}

export async function createVisitBundle(
  appUserId: string,
  bundle: VisitBundle
): Promise<VisitBundle> {
  const petId = bundle.visit?.petId;
  if (!petId) throw httpError(400, 'Chýba petId v návšteve.', 'INVALID_INPUT');
  await assertPetOwned(appUserId, petId);

  for (const v of bundle.vaccinations ?? []) {
    if (isInvalidRange(v.dateApplied, v.validUntil)) {
      throw httpError(
        400,
        'Dátum platnosti vakcinácie musí byť rovnaký alebo neskôr ako dátum aplikácie.',
        'INVALID_DATE_RANGE'
      );
    }
  }
  for (const d of bundle.dewormings ?? []) {
    if (isInvalidRange(d.dateGiven, d.nextDueDate)) {
      throw httpError(
        400,
        'Ďalšia dávka odčervenia musí byť rovnaká alebo neskôr ako dátum podania.',
        'INVALID_DATE_RANGE'
      );
    }
  }
  for (const e of bundle.ectos ?? []) {
    if (isInvalidRange(e.dateGiven, e.nextDueDate)) {
      throw httpError(
        400,
        'Ďalšia dávka antiparazitika musí byť rovnaká alebo neskôr ako dátum podania.',
        'INVALID_DATE_RANGE'
      );
    }
  }

  // 1. Návšteva (bez medication_ids — doplníme po vytvorení liekov).
  const [visitRow] = await insertMany('vet_visits', [
    { ...vetVisitMapper.toRow({ ...bundle.visit, medicationIds: [] }), pet_id: petId },
  ]);
  const realVisitId = String(visitRow.id);

  // 2. Lieky → mapa temp-id → real-id.
  const medRows = await insertMany(
    'medications',
    bundle.medications.map((m) => ({
      ...medicationMapper.toRow(m),
      pet_id: petId,
      from_vet_visit_id: realVisitId,
    }))
  );
  const medMap = new Map<string, string>();
  bundle.medications.forEach((m, i) => medMap.set(m.id, String(medRows[i].id)));

  // 3. Diétne záznamy → mapa temp-id → real-id.
  const dietRows = await insertMany(
    'diet_entries',
    bundle.dietEntries.map((d) => ({ ...dietEntryMapper.toRow(d), pet_id: petId }))
  );
  const dietMap = new Map<string, string>();
  bundle.dietEntries.forEach((d, i) => dietMap.set(d.id, String(dietRows[i].id)));

  // 4. Dose-logy (medication_id premapované).
  const doseRows = await insertMany(
    'medication_dose_logs',
    bundle.doseLogs.map((dl) => ({
      ...doseLogMapper.toRow({
        ...dl,
        medicationId: medMap.get(dl.medicationId) ?? dl.medicationId,
      }),
      pet_id: petId,
    }))
  );

  // 5. Ostatné záznamy naviazané na pet.
  const vaccRows = await insertMany(
    'vaccinations',
    bundle.vaccinations.map((v) => ({ ...vaccinationMapper.toRow(v), pet_id: petId }))
  );
  const dewormRows = await insertMany(
    'dewormings',
    bundle.dewormings.map((d) => ({ ...dewormingMapper.toRow(d), pet_id: petId }))
  );
  const ectoRows = await insertMany(
    'ectoparasites',
    bundle.ectos.map((e) => ({ ...ectoparasiteMapper.toRow(e), pet_id: petId }))
  );

  // 6. Výdavky (related id premapované na reálne).
  const expenseRows = await insertMany(
    'expenses',
    bundle.expenses.map((e) => ({
      ...expenseMapper.toRow({
        ...e,
        relatedVetVisitId: e.relatedVetVisitId ? realVisitId : undefined,
        relatedDietEntryId: e.relatedDietEntryId
          ? (dietMap.get(e.relatedDietEntryId) ?? undefined)
          : undefined,
      }),
      pet_id: petId,
    }))
  );

  // 7. Doplň reálne medication_ids do návštevy.
  const realMedIds =
    bundle.visit.medicationIds.length > 0
      ? bundle.visit.medicationIds
          .map((mid) => medMap.get(mid))
          .filter((x): x is string => Boolean(x))
      : medRows.map((m) => String(m.id));

  const { data: updatedVisit, error: updateError } = await getSupabase()
    .from('vet_visits')
    .update({ medication_ids: realMedIds })
    .eq('id', realVisitId)
    .select('*')
    .single();
  if (updateError) throw updateError;

  return {
    visit: vetVisitMapper.toDto(updatedVisit as Row),
    vaccinations: vaccRows.map(vaccinationMapper.toDto),
    dewormings: dewormRows.map(dewormingMapper.toDto),
    ectos: ectoRows.map(ectoparasiteMapper.toDto),
    medications: medRows.map(medicationMapper.toDto),
    doseLogs: doseRows.map(doseLogMapper.toDto),
    dietEntries: dietRows.map(dietEntryMapper.toDto),
    expenses: expenseRows.map(expenseMapper.toDto),
  };
}
