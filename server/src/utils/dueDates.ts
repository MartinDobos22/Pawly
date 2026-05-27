export type DueStatus = 'OVERDUE' | 'DUE_SOON' | 'OK';

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Počet dní od dnešnej polnoci po `iso` (záporné = po termíne). `null` ak dátum neplatný. */
export function daysUntil(iso: string): number | null {
  if (!iso) return null;
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return null;
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - startOfToday()) / 86_400_000);
}

export function dueStatus(days: number, soonDays = 30): DueStatus {
  if (days < 0) return 'OVERDUE';
  if (days <= soonDays) return 'DUE_SOON';
  return 'OK';
}
