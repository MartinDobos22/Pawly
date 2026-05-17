import type { ValidityStatus } from '../../types/dogHealth';
import { KNOWN_DEWORMING_KEYWORDS, KNOWN_ECTOPARASITE_KEYWORDS } from './constants.ts';

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

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
