import type { ValidityStatus } from '../../types/dogHealth';

function formatDateShort(value: string, lang = 'sk-SK'): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface VetStatus {
  status: ValidityStatus;
  detail: string;
}

export function vetStatusFor(
  date: string | undefined,
  soonDays = 30,
  translate?: (key: string, opts?: Record<string, unknown>) => string,
  lang = 'sk-SK'
): VetStatus {
  if (!date)
    return { status: 'UNKNOWN', detail: translate ? translate('vetStatus.unknown') : 'Nezadané' };
  const now = new Date();
  const target = new Date(date);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0)
    return { status: 'EXPIRED', detail: translate ? translate('vetStatus.expired') : 'Expirované' };
  const formatted = formatDateShort(date, lang);
  if (diff <= soonDays)
    return {
      status: 'EXPIRING_SOON',
      detail: translate
        ? translate('vetStatus.willExpire', { date: formatted })
        : `Vyprší ${formatted}`,
    };
  return {
    status: 'VALID',
    detail: translate
      ? translate('vetStatus.validUntil', { date: formatted })
      : `Platné do ${formatted}`,
  };
}
