import type { TreatmentCategory, TreatmentForm } from '../types/petHealth';

export const TREATMENT_CATEGORY_ORDER: TreatmentCategory[] = [
  'ALLERGY_SKIN',
  'PAIN_JOINTS',
  'HEART',
  'ENDOCRINE',
  'NEURO',
  'DIGESTIVE',
  'RENAL_URINARY',
  'EYES',
  'EARS',
  'BEHAVIOR',
  'INFECTION',
  'IMMUNE',
  'ONCOLOGY',
  'OTHER',
];

export const TREATMENT_FORM_ORDER: TreatmentForm[] = [
  'TABLET',
  'INJECTION',
  'DROPS',
  'TOPICAL',
  'DIET',
  'OTHER',
];
