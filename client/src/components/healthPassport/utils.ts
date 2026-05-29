import type { ValidityStatus, VaccinationRecord } from '../../types/dogHealth';
import { KNOWN_DEWORMING_KEYWORDS, KNOWN_ECTOPARASITE_KEYWORDS } from './constants.ts';

const MIN_NAME_OVERLAP = 4;
const DUPLICATE_WINDOW_DAYS = 30;

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na.length < MIN_NAME_OVERLAP || nb.length < MIN_NAME_OVERLAP) return false;
  return na.includes(nb) || nb.includes(na);
}

function diseaseMatches(disease: string | undefined, existing: VaccinationRecord): boolean {
  if (!disease) return false;
  const d = disease.toLowerCase();
  if (existing.type === 'RABIES' && /(rabies|besnot)/i.test(d)) return true;
  if (existing.type === 'COMBINED' && /(combined|kombin|dhppi|parvo|distemper)/i.test(d))
    return true;
  return false;
}

export function isDuplicateVaccination(params: {
  productName: string;
  sourceDisease?: string;
  date: string;
  existing: VaccinationRecord[];
  dogId: string;
}): boolean {
  const { productName, sourceDisease, date, existing, dogId } = params;
  const target = new Date(date).getTime();
  if (Number.isNaN(target)) return false;

  return existing.some((rec) => {
    if (rec.dogId !== dogId) return false;
    const recTime = new Date(rec.dateApplied).getTime();
    if (Number.isNaN(recTime)) return false;
    const diffDays = Math.abs(recTime - target) / (1000 * 60 * 60 * 24);
    if (diffDays > DUPLICATE_WINDOW_DAYS) return false;
    return namesMatch(productName, rec.name) || diseaseMatches(sourceDisease, rec);
  });
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const today = () => new Date().toISOString().slice(0, 10);

export const plusDays = (date: string, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const computeIntervalDaysFromDates = (
  dateGiven: string,
  validUntil: string,
  fallback: number
) => {
  if (!validUntil) return fallback;
  const start = new Date(dateGiven).getTime();
  const end = new Date(validUntil).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return fallback;
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, days || fallback);
};

export function statusByDate(targetDate: string, soonDays: number): ValidityStatus {
  const now = new Date(today());
  const t = new Date(targetDate);
  const diff = Math.ceil((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'EXPIRED';
  if (diff <= soonDays) return 'EXPIRING_SOON';
  return 'VALID';
}

export const normalizeDateInput = (value: string) => {
  if (!value) return today();
  if (/^(\d{4})-(\d{2})-(\d{2})$/.test(value)) return value;
  const m = value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${year}-${month}-${day}`;
  }
  return today();
};

export const inferAiTargetType = (
  disease: string,
  vaccineName: string
): 'VACCINATION' | 'DEWORMING' | 'ECTOPARASITE' => {
  const value = `${disease} ${vaccineName}`.toLowerCase();
  if (KNOWN_DEWORMING_KEYWORDS.some((k) => value.includes(k))) return 'DEWORMING';
  if (KNOWN_ECTOPARASITE_KEYWORDS.some((k) => value.includes(k))) return 'ECTOPARASITE';
  return 'VACCINATION';
};

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const statusColor = (status: ValidityStatus) => {
  if (status === 'VALID') return 'success';
  if (status === 'EXPIRING_SOON') return 'warning';
  if (status === 'UNKNOWN') return 'default';
  return 'error';
};

export const statusLabel = (status: ValidityStatus) => {
  if (status === 'VALID') return 'Platné';
  if (status === 'EXPIRING_SOON') return 'Vyprší čoskoro';
  if (status === 'UNKNOWN') return 'Nezadané';
  return 'Expirované';
};

export const formatDate = (iso: string, locale = 'sk-SK') =>
  new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
