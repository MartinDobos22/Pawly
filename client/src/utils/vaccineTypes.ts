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

export const VACCINE_TYPE_KEYWORDS: Record<VaccineType, string[]> = {
  RABIES: ['rabies', 'besnot', 'rabisin', 'tollwut', 'wut'],
  COMBINED: ['combined', 'kombin', 'dhppi', 'dhpp', 'sextavac', 'puppy dp', 'l4'],
  DISTEMPER: ['distemper', 'psink', 'carre'],
  PARVOVIROSIS: ['parvo'],
  HEPATITIS: ['hepatit', 'adenovir', 'rubarth', 'hcc'],
  PARAINFLUENZA: ['parainfluen'],
  LEPTOSPIROSIS: ['lepto'],
  KENNEL_COUGH: ['kennel', 'kotercov', 'bordetell', 'bronchisept', 'tracheobronch'],
  LYME: ['lyme', 'lymsk', 'borrelio', 'borelio'],
  OTHER: [],
};

export function inferVaccineType(...texts: Array<string | undefined>): VaccineType {
  const haystack = texts.filter(Boolean).join(' ').toLowerCase();
  if (!haystack.trim()) return 'OTHER';
  for (const type of VACCINE_TYPE_ORDER) {
    if (type === 'OTHER') continue;
    if (VACCINE_TYPE_KEYWORDS[type].some((keyword) => haystack.includes(keyword))) return type;
  }
  return 'OTHER';
}
