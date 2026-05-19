import type { ValidityStatus } from '../../types/dogHealth';

function formatDateShort(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('sk-SK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface VetStatus {
  status: ValidityStatus;
  detail: string;
}

export function vetStatusFor(date: string | undefined, soonDays = 30): VetStatus {
  if (!date) return { status: 'UNKNOWN', detail: 'Nezadané' };
  const now = new Date();
  const t = new Date(date);
  const diff = Math.ceil((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { status: 'EXPIRED', detail: 'Expirované' };
  if (diff <= soonDays)
    return { status: 'EXPIRING_SOON', detail: `Vyprší ${formatDateShort(date)}` };
  return { status: 'VALID', detail: `Platné do ${formatDateShort(date)}` };
}
