import i18n from '../i18n';

const MS_PER_DAY = 86_400_000;

type UnitKey = 'day' | 'week' | 'month' | 'year';

function pickUnit(abs: number): { value: number; unit: UnitKey } {
  if (abs < 14) return { value: abs, unit: 'day' };
  if (abs < 60) return { value: Math.round(abs / 7), unit: 'week' };
  if (abs < 730) return { value: Math.round(abs / 30), unit: 'month' };
  return { value: Math.round(abs / 365), unit: 'year' };
}

function unitWord(unit: UnitKey, count: number): string {
  return i18n.t(`relativeDate.${unit}`, { ns: 'common', count }) as string;
}

export function daysDiff(target: string | Date): number {
  const date = typeof target === 'string' ? new Date(target) : target;
  if (Number.isNaN(date.getTime())) return Number.NaN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / MS_PER_DAY);
}

export interface RelativeDate {
  diffDays: number;
  text: string;
  short: string;
  isPast: boolean;
  isToday: boolean;
}

export function relativeDate(target: string | Date): RelativeDate | null {
  const diff = daysDiff(target);
  if (Number.isNaN(diff)) return null;

  const isToday = diff === 0;
  const isPast = diff < 0;
  const abs = Math.abs(diff);

  if (isToday) {
    return {
      diffDays: 0,
      text: i18n.t('relativeDate.today', { ns: 'common' }) as string,
      short: i18n.t('relativeDate.todayShort', { ns: 'common' }) as string,
      isPast: false,
      isToday: true,
    };
  }

  const { value, unit } = pickUnit(abs);
  const word = unitWord(unit, value);

  const text = isPast
    ? (i18n.t('relativeDate.past', { ns: 'common', count: value, unit: word }) as string)
    : (i18n.t('relativeDate.future', { ns: 'common', count: value, unit: word }) as string);
  const short = isPast
    ? (i18n.t('relativeDate.pastShort', { ns: 'common', count: value, unit: word }) as string)
    : (i18n.t('relativeDate.futureShort', { ns: 'common', count: value, unit: word }) as string);

  return { diffDays: diff, text, short, isPast, isToday: false };
}

export function formatDateShort(target: string | Date, locale?: string): string {
  const date = typeof target === 'string' ? new Date(target) : target;
  if (Number.isNaN(date.getTime())) return '';
  const loc = locale ?? (i18n.language === 'en' ? 'en-GB' : 'sk-SK');
  return date.toLocaleDateString(loc, { day: 'numeric', month: 'numeric', year: 'numeric' });
}
