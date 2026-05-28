const MS_PER_DAY = 86_400_000;

const pluralDay = (n: number) => {
  const abs = Math.abs(n);
  if (abs === 1) return 'deň';
  if (abs >= 2 && abs <= 4) return 'dni';
  return 'dní';
};

const pluralWeek = (n: number) => {
  const abs = Math.abs(n);
  if (abs === 1) return 'týždeň';
  if (abs >= 2 && abs <= 4) return 'týždne';
  return 'týždňov';
};

const pluralMonth = (n: number) => {
  const abs = Math.abs(n);
  if (abs === 1) return 'mesiac';
  if (abs >= 2 && abs <= 4) return 'mesiace';
  return 'mesiacov';
};

const pluralYear = (n: number) => {
  const abs = Math.abs(n);
  if (abs === 1) return 'rok';
  if (abs >= 2 && abs <= 4) return 'roky';
  return 'rokov';
};

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

  let unit: { value: number; word: (n: number) => string };
  if (abs < 14) unit = { value: abs, word: pluralDay };
  else if (abs < 60) unit = { value: Math.round(abs / 7), word: pluralWeek };
  else if (abs < 730) unit = { value: Math.round(abs / 30), word: pluralMonth };
  else unit = { value: Math.round(abs / 365), word: pluralYear };

  if (isToday) {
    return { diffDays: 0, text: 'Dnes', short: 'dnes', isPast: false, isToday: true };
  }

  const word = unit.word(unit.value);
  const text = isPast ? `Pred ${unit.value} ${word}` : `O ${unit.value} ${word}`;
  const short = isPast ? `−${unit.value} ${word}` : `+${unit.value} ${word}`;

  return { diffDays: diff, text, short, isPast, isToday: false };
}

export function formatDateShort(target: string | Date): string {
  const date = typeof target === 'string' ? new Date(target) : target;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric', year: 'numeric' });
}
