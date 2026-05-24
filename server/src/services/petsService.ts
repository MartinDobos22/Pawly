import { getSupabase } from '../config/supabase';
import type { PetProfile } from '../types';

type DbError = Error & { status?: number; code?: string };

function notFound(): DbError {
  const err = new Error('Zviera sa nenašlo.') as DbError;
  err.status = 404;
  err.code = 'NOT_FOUND';
  return err;
}

interface PetRow {
  id: string;
  name: string;
  animal_type: PetProfile['animalType'];
  breed: string | null;
  date_of_birth: string | null;
  date_of_birth_precision: PetProfile['dateOfBirthPrecision'] | null;
  birth_year: number | null;
  birth_month: number | null;
  sex: PetProfile['sex'] | null;
  age_years: number | null;
  age_months: number | null;
  weight_kg: number | null;
  photo_url: string | null;
  microchip_number: string | null;
  passport_number: string | null;
  size: PetProfile['size'] | null;
  life_stage: PetProfile['lifeStage'] | null;
  activity_level: PetProfile['activityLevel'] | null;
  allergies: string[];
  intolerances: string[];
  health_conditions: string[];
  chronic_conditions: NonNullable<PetProfile['chronicConditions']>;
  procedures: NonNullable<PetProfile['procedures']>;
  notes: string | null;
}

function rowToProfile(row: PetRow): PetProfile {
  return {
    id: row.id,
    name: row.name,
    animalType: row.animal_type,
    breed: row.breed ?? undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    dateOfBirthPrecision: row.date_of_birth_precision ?? undefined,
    birthYear: row.birth_year ?? undefined,
    birthMonth: row.birth_month ?? undefined,
    sex: row.sex ?? undefined,
    ageYears: row.age_years ?? undefined,
    ageMonths: row.age_months ?? undefined,
    weightKg: row.weight_kg ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    microchipNumber: row.microchip_number ?? undefined,
    passportNumber: row.passport_number ?? undefined,
    size: row.size ?? undefined,
    lifeStage: row.life_stage ?? undefined,
    activityLevel: row.activity_level ?? undefined,
    allergies: row.allergies ?? [],
    intolerances: row.intolerances ?? [],
    healthConditions: row.health_conditions ?? [],
    chronicConditions: row.chronic_conditions ?? [],
    procedures: row.procedures ?? [],
    notes: row.notes ?? undefined,
  };
}

function profileToRow(payload: Partial<PetProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined) row[key] = value;
  };
  set('name', payload.name);
  set('animal_type', payload.animalType);
  set('breed', payload.breed);
  const normalizedDob =
    typeof payload.dateOfBirth === 'string' && payload.dateOfBirth.trim() === ''
      ? null
      : payload.dateOfBirth;
  set('date_of_birth', normalizedDob);
  set('date_of_birth_precision', payload.dateOfBirthPrecision);
  set('birth_year', payload.birthYear);
  set('birth_month', payload.birthMonth);
  set('sex', payload.sex);
  set('age_years', payload.ageYears);
  set('age_months', payload.ageMonths);
  set('weight_kg', payload.weightKg);
  set('photo_url', payload.photoUrl);
  set('microchip_number', payload.microchipNumber);
  set('passport_number', payload.passportNumber);
  set('size', payload.size);
  set('life_stage', payload.lifeStage);
  set('activity_level', payload.activityLevel);
  set('allergies', payload.allergies);
  set('intolerances', payload.intolerances);
  set('health_conditions', payload.healthConditions);
  set('chronic_conditions', payload.chronicConditions);
  set('procedures', payload.procedures);
  set('notes', payload.notes);
  return row;
}

export async function listPets(appUserId: string): Promise<PetProfile[]> {
  const { data, error } = await getSupabase()
    .from('pets')
    .select('*')
    .eq('user_id', appUserId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as PetRow[]).map(rowToProfile);
}

export async function getPet(appUserId: string, petId: string): Promise<PetProfile> {
  const { data, error } = await getSupabase()
    .from('pets')
    .select('*')
    .eq('user_id', appUserId)
    .eq('id', petId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();
  return rowToProfile(data as PetRow);
}

export async function createPet(
  appUserId: string,
  payload: Partial<PetProfile>
): Promise<PetProfile> {
  const row = { ...profileToRow(payload), user_id: appUserId };
  const { data, error } = await getSupabase().from('pets').insert(row).select('*').single();
  if (error) throw error;
  return rowToProfile(data as PetRow);
}

export async function updatePet(
  appUserId: string,
  petId: string,
  payload: Partial<PetProfile>
): Promise<PetProfile> {
  const { data, error } = await getSupabase()
    .from('pets')
    .update(profileToRow(payload))
    .eq('user_id', appUserId)
    .eq('id', petId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();
  return rowToProfile(data as PetRow);
}

export async function deletePet(appUserId: string, petId: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from('pets')
    .delete()
    .eq('user_id', appUserId)
    .eq('id', petId)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();
}
