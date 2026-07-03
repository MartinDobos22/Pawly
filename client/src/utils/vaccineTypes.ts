import type { VaccineType } from '../types/petHealth';

export const VACCINE_TYPE_ORDER: VaccineType[] = [
  'RABIES',
  'COMBINED',
  'DISTEMPER',
  'PARVOVIROSIS',
  'HEPATITIS',
  'PARAINFLUENZA',
  'LEPTOSPIROSIS',
  'KENNEL_COUGH',
  'LYME',
  'OTHER',
];

// Substring keywords — matched anywhere (disease names, prefixes, full product names).
export const VACCINE_TYPE_KEYWORDS: Record<VaccineType, string[]> = {
  RABIES: ['rabies', 'besnot', 'rabisin', 'tollwut'],
  COMBINED: ['combined', 'kombin', 'dhppi', 'dhpp', 'sextavac', 'nobivac dp', 'puppy dp'],
  DISTEMPER: ['distemper', 'psink', 'carre'],
  PARVOVIROSIS: ['parvo'],
  HEPATITIS: ['hepatit', 'adenovir', 'rubarth'],
  PARAINFLUENZA: ['parainfluen'],
  LEPTOSPIROSIS: ['lepto'],
  KENNEL_COUGH: ['kennel', 'kotercov', 'bordetell', 'bronchisept', 'tracheobronch'],
  LYME: ['lyme', 'lymsk', 'borrelio', 'borelio'],
  OTHER: [],
};

// Short manufacturer abbreviations — matched as whole tokens so they don't hit
// substrings inside lot numbers (e.g. "L4" in "Nobivac L4", "KC", "DP PLUS").
export const VACCINE_TYPE_CODES: Record<VaccineType, string[]> = {
  RABIES: [],
  COMBINED: ['dhp', 'dp'],
  DISTEMPER: [],
  PARVOVIROSIS: [],
  HEPATITIS: ['hcc'],
  PARAINFLUENZA: [],
  LEPTOSPIROSIS: ['l4', 'l2'],
  KENNEL_COUGH: ['kc'],
  LYME: [],
  OTHER: [],
};

const matchesType = (haystack: string, type: VaccineType): boolean => {
  if (VACCINE_TYPE_KEYWORDS[type].some((keyword) => haystack.includes(keyword))) return true;
  return VACCINE_TYPE_CODES[type].some((code) => new RegExp(`\\b${code}\\b`, 'i').test(haystack));
};

export function matchesVaccineType(text: string | undefined, type: VaccineType): boolean {
  if (!text) return false;
  return matchesType(text.toLowerCase(), type);
}

export function inferVaccineType(...texts: Array<string | undefined>): VaccineType {
  const haystack = texts.filter(Boolean).join(' ').toLowerCase();
  if (!haystack.trim()) return 'OTHER';
  for (const type of VACCINE_TYPE_ORDER) {
    if (type === 'OTHER') continue;
    if (matchesType(haystack, type)) return type;
  }
  return 'OTHER';
}
