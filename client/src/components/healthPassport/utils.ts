import type { ValidityStatus, VaccinationRecord } from '../../types/petHealth';
import { KNOWN_DEWORMING_KEYWORDS, KNOWN_ECTOPARASITE_KEYWORDS } from './constants.ts';
import { VACCINE_TYPE_KEYWORDS } from '../../utils/vaccineTypes';

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
  return (VACCINE_TYPE_KEYWORDS[existing.type] ?? []).some((keyword) => d.includes(keyword));
}

export function isDuplicateVaccination(params: {
  productName: string;
  sourceDisease?: string;
  date: string;
  existing: VaccinationRecord[];
  petId: string;
}): boolean {
  const { productName, sourceDisease, date, existing, petId } = params;
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return false;
  const targetYear = target.getUTCFullYear();

  return existing.some((rec) => {
    if (rec.petId !== petId) return false;
    const recDate = new Date(rec.dateApplied);
    if (Number.isNaN(recDate.getTime())) return false;
    const diffDays = Math.abs(recDate.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
    const sameName = namesMatch(productName, rec.name);
    const sameDisease = diseaseMatches(sourceDisease, rec);
    if (diffDays <= DUPLICATE_WINDOW_DAYS && (sameName || sameDisease)) return true;
    if (recDate.getUTCFullYear() === targetYear && (sameName || sameDisease)) return true;
    return false;
  });
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const today = () => new Date().toISOString().slice(0, 10);

export const plusDays = (date: string, days: number) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
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

const STATUS_SCORE: Record<ValidityStatus, number | null> = {
  VALID: 100,
  EXPIRING_SOON: 60,
  EXPIRED: 10,
  UNKNOWN: null,
};

/**
 * Heuristic 0–100 pet health score. Averages the known preventive-care/diet
 * validity statuses (UNKNOWN items are excluded so a brand-new pet shows `null`)
 * and applies a small penalty for each currently-active health episode.
 */
export function computeHealthScore(
  statuses: ValidityStatus[],
  activeEpisodeCount = 0
): number | null {
  const known = statuses
    .map((s) => STATUS_SCORE[s])
    .filter((v): v is number => v !== null);
  if (known.length === 0) return null;
  const base = known.reduce((a, b) => a + b, 0) / known.length;
  const penalty = Math.min(20, activeEpisodeCount * 8);
  return Math.max(0, Math.min(100, Math.round(base - penalty)));
}

export function statusByDate(targetDate: string, soonDays: number): ValidityStatus {
  const now = new Date(today());
  const t = new Date(targetDate);
  const diff = Math.ceil((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'EXPIRED';
  if (diff <= soonDays) return 'EXPIRING_SOON';
  return 'VALID';
}

const MIN_YEAR = 1990;
const MAX_YEAR_OFFSET = 30;

const isPlausibleDate = (iso: string): boolean => {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return false;
  const year = t.getUTCFullYear();
  const maxYear = new Date().getUTCFullYear() + MAX_YEAR_OFFSET;
  return year >= MIN_YEAR && year <= maxYear;
};

export const normalizeDateInput = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return isPlausibleDate(trimmed) ? trimmed : null;
  }
  const m = trimmed.match(/^(\d{1,2})\s*[./\- ]\s*(\d{1,2})\s*[./\- ]\s*(\d{2,4})$/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    const iso = `${year}-${month}-${day}`;
    return isPlausibleDate(iso) ? iso : null;
  }
  return null;
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
