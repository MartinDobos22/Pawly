import type { CheckIn } from '../types/petHealth';

export type SymptomField = 'appetite' | 'energy' | 'stool' | 'skinCoat' | 'behavior';

export interface SymptomOccurrence {
  field: SymptomField;
  value: string;
  count: number;
}

const FIELDS: SymptomField[] = ['appetite', 'energy', 'stool', 'skinCoat', 'behavior'];
const RECURRING_THRESHOLD = 2;

function withinDays(dateIso: string, days: number, now: number): boolean {
  const t = new Date(dateIso).getTime();
  if (Number.isNaN(t)) return false;
  return now - t <= days * 86_400_000;
}

/** Spočíta výskyty ne-normálnych príznakov v posledných `days` dňoch. */
export function recentSymptomCounts(
  checkIns: CheckIn[],
  days: number,
  now: number = Date.now()
): SymptomOccurrence[] {
  const counts = new Map<string, SymptomOccurrence>();
  for (const c of checkIns) {
    if (!withinDays(c.date, days, now)) continue;
    for (const field of FIELDS) {
      const value = c[field];
      if (!value || value === 'normal') continue;
      const key = `${field}:${value}`;
      const prev = counts.get(key);
      if (prev) prev.count += 1;
      else counts.set(key, { field, value, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

/** Príznaky, ktoré sa v okne opakujú (≥ prah) — kandidáti na zdravotnú epizódu. */
export function recurringSymptoms(
  checkIns: CheckIn[],
  days: number,
  now: number = Date.now()
): SymptomOccurrence[] {
  return recentSymptomCounts(checkIns, days, now).filter((o) => o.count >= RECURRING_THRESHOLD);
}
