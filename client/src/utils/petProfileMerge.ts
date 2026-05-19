import type { PetProfile } from '../types';

export interface PetProfilePatch {
  identifiers?: {
    name?: string;
    breed?: string;
    dateOfBirth?: string;
    sex?: 'MALE' | 'FEMALE' | 'UNKNOWN';
    microchipNumber?: string;
    passportNumber?: string;
  };
  allergies?: string[];
  chronicConditions?: string[];
}

export type IdentifierKey = NonNullable<keyof NonNullable<PetProfilePatch['identifiers']>>;

export interface MergeAcceptance {
  identifiers: Partial<Record<IdentifierKey, boolean>>;
  allergies: string[];
  chronicConditions: string[];
}

export interface MergeResult {
  merged: PetProfile;
  changedFields: string[];
}

function isEmptyScalar(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

function dedupStrings(
  existing: string[],
  additions: string[]
): { merged: string[]; added: string[] } {
  const seen = new Set(existing.map((s) => s.trim().toLowerCase()));
  const added: string[] = [];
  const merged = [...existing];
  for (const candidate of additions) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(trimmed);
    added.push(trimmed);
  }
  return { merged, added };
}

function dedupChronicConditions(
  existing: NonNullable<PetProfile['chronicConditions']>,
  additions: string[]
): { merged: NonNullable<PetProfile['chronicConditions']>; added: string[] } {
  const seen = new Set(existing.map((c) => c.title.trim().toLowerCase()));
  const added: string[] = [];
  const merged = [...existing];
  for (const candidate of additions) {
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `cc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    merged.push({ id, title: trimmed });
    added.push(trimmed);
  }
  return { merged, added };
}

const IDENTIFIER_LABELS: Record<IdentifierKey, string> = {
  name: 'meno',
  breed: 'plemeno',
  dateOfBirth: 'dátum narodenia',
  sex: 'pohlavie',
  microchipNumber: 'mikročip',
  passportNumber: 'číslo pasu',
};

export function mergePetProfile(
  existing: PetProfile,
  patch: PetProfilePatch,
  acceptance: MergeAcceptance
): MergeResult {
  const merged: PetProfile = { ...existing };
  const changedFields: string[] = [];

  if (patch.identifiers) {
    (Object.keys(IDENTIFIER_LABELS) as IdentifierKey[]).forEach((key) => {
      if (!acceptance.identifiers[key]) return;
      const incoming = patch.identifiers?.[key];
      if (isEmptyScalar(incoming)) return;
      if (!isEmptyScalar(existing[key])) return; // non-destructive
      // Cast is safe — keys are constrained to PetProfile identifier fields with matching shapes.
      (merged as unknown as Record<string, unknown>)[key] = incoming;
      changedFields.push(IDENTIFIER_LABELS[key]);
    });
  }

  if (acceptance.allergies.length > 0 && patch.allergies && patch.allergies.length > 0) {
    const accepted = patch.allergies.filter((a) =>
      acceptance.allergies.some((sel) => sel.trim().toLowerCase() === a.trim().toLowerCase())
    );
    const { merged: nextAllergies, added } = dedupStrings(existing.allergies ?? [], accepted);
    merged.allergies = nextAllergies;
    if (added.length > 0) {
      changedFields.push(`${added.length} ${added.length === 1 ? 'alergia' : 'alergie'}`);
    }
  }

  if (
    acceptance.chronicConditions.length > 0 &&
    patch.chronicConditions &&
    patch.chronicConditions.length > 0
  ) {
    const accepted = patch.chronicConditions.filter((c) =>
      acceptance.chronicConditions.some(
        (sel) => sel.trim().toLowerCase() === c.trim().toLowerCase()
      )
    );
    const { merged: nextConditions, added } = dedupChronicConditions(
      existing.chronicConditions ?? [],
      accepted
    );
    merged.chronicConditions = nextConditions;
    if (added.length > 0) {
      changedFields.push(
        `${added.length} ${added.length === 1 ? 'chronický stav' : 'chronické stavy'}`
      );
    }
  }

  return { merged, changedFields };
}

export function hasPatchAnyData(patch: PetProfilePatch | null | undefined): boolean {
  if (!patch) return false;
  const idHasAny = patch.identifiers
    ? Object.values(patch.identifiers).some((v) => !isEmptyScalar(v))
    : false;
  const allergiesAny = (patch.allergies ?? []).some((a) => a.trim() !== '');
  const chronicAny = (patch.chronicConditions ?? []).some((c) => c.trim() !== '');
  return idHasAny || allergiesAny || chronicAny;
}

export { IDENTIFIER_LABELS };
