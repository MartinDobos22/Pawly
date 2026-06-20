import type { CheckIn, CheckInSeverity } from '../types/petHealth';

type SymptomFields = Pick<
  CheckIn,
  'overallStatus' | 'appetite' | 'energy' | 'stool' | 'skinCoat' | 'behavior'
>;

const ATTENTION = {
  stool: ['diarrhea', 'blood_mucus'],
  energy: ['very_low'],
  behavior: ['pain'],
  appetite: ['refuses'],
} as const;

function hasAbnormalSymptom(c: SymptomFields): boolean {
  return (
    (c.appetite != null && c.appetite !== 'normal') ||
    (c.energy != null && c.energy !== 'normal') ||
    (c.stool != null && c.stool !== 'normal') ||
    (c.skinCoat != null && c.skinCoat !== 'normal') ||
    (c.behavior != null && c.behavior !== 'normal')
  );
}

export function computeSeverity(c: SymptomFields): CheckInSeverity {
  const attention =
    (c.stool != null && (ATTENTION.stool as readonly string[]).includes(c.stool)) ||
    (c.energy != null && (ATTENTION.energy as readonly string[]).includes(c.energy)) ||
    (c.behavior != null && (ATTENTION.behavior as readonly string[]).includes(c.behavior)) ||
    (c.appetite != null && (ATTENTION.appetite as readonly string[]).includes(c.appetite));
  if (attention) return 'attention';
  if (c.overallStatus !== 'ok' || hasAbnormalSymptom(c)) return 'mild';
  return 'none';
}
