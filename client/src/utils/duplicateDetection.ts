import type {
  DewormingRecord,
  EctoparasiteRecord,
  MedicationRecord,
  VaccinationRecord,
} from '../types/dogHealth';
import type { VisitBundle } from './vetVisitHelper';

export type DuplicateRecordType = 'vaccination' | 'deworming' | 'ectoparasite' | 'medication';

export interface DuplicateMatch {
  type: DuplicateRecordType;
  label: string;
  date: string;
  existingId: string;
}

interface ExistingRecords {
  vaccinations: VaccinationRecord[];
  dewormings: DewormingRecord[];
  ectos: EctoparasiteRecord[];
  medications: MedicationRecord[];
}

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function sameDay(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  // Porovnáme len YYYY-MM-DD prefix — ignorujeme čas.
  return a.slice(0, 10) === b.slice(0, 10);
}

/**
 * Pre každý nový záznam v bundli skontroluje či už existuje rovnaký záznam
 * (rovnaké meno + rovnaký dátum) v existujúcich dátach pre toho istého psa.
 * Vráti zoznam detekovaných duplicít.
 */
export function findBundleDuplicates(
  bundle: VisitBundle,
  existing: ExistingRecords
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const dogId = bundle.visit.dogId;

  for (const v of bundle.vaccinations) {
    const dup = existing.vaccinations.find(
      (e) =>
        e.dogId === dogId && norm(e.name) === norm(v.name) && sameDay(e.validUntil, v.validUntil)
    );
    if (dup) {
      matches.push({
        type: 'vaccination',
        label: v.name,
        date: v.validUntil,
        existingId: dup.id,
      });
    }
  }

  for (const d of bundle.dewormings) {
    const dup = existing.dewormings.find(
      (e) =>
        e.dogId === dogId &&
        norm(e.productName) === norm(d.productName) &&
        sameDay(e.nextDueDate, d.nextDueDate)
    );
    if (dup) {
      matches.push({
        type: 'deworming',
        label: d.productName,
        date: d.nextDueDate,
        existingId: dup.id,
      });
    }
  }

  for (const e of bundle.ectos) {
    const dup = existing.ectos.find(
      (ex) =>
        ex.dogId === dogId &&
        norm(ex.productName) === norm(e.productName) &&
        sameDay(ex.nextDueDate, e.nextDueDate)
    );
    if (dup) {
      matches.push({
        type: 'ectoparasite',
        label: e.productName,
        date: e.nextDueDate,
        existingId: dup.id,
      });
    }
  }

  for (const m of bundle.medications) {
    const dup = existing.medications.find(
      (e) => e.dogId === dogId && norm(e.name) === norm(m.name) && sameDay(e.startDate, m.startDate)
    );
    if (dup) {
      matches.push({
        type: 'medication',
        label: m.name,
        date: m.startDate,
        existingId: dup.id,
      });
    }
  }

  return matches;
}
