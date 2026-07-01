import type { CheckIn, DietEntry } from '../types/petHealth';
import type { SymptomField } from './checkInTrends';

export type FoodInsightKind = 'appeared' | 'improved' | 'noReaction';
export type FoodInsightTone = 'watch' | 'positive';

export interface FoodInsight {
  kind: FoodInsightKind;
  foodName: string;
  field?: SymptomField;
  tone: FoodInsightTone;
}

const WINDOW_DAYS = 14;
const DAY_MS = 86_400_000;
const SYMPTOM_FIELDS: SymptomField[] = ['stool', 'skinCoat', 'energy', 'appetite', 'behavior'];
const MAX_INSIGHTS = 5;

function ms(dateIso: string): number {
  return new Date(dateIso).getTime();
}

function abnormalInRange(
  checkIns: CheckIn[],
  field: SymptomField,
  fromMs: number,
  toMs: number
): boolean {
  return checkIns.some((c) => {
    const t = ms(c.date);
    if (Number.isNaN(t) || t < fromMs || t > toMs) return false;
    const value = c[field];
    return !!value && value !== 'normal';
  });
}

/** Pravidlové, opatrné súvislosti medzi zmenou (hlavného) krmiva a príznakmi. */
export function computeFoodInsights(
  dietEntries: DietEntry[],
  checkIns: CheckIn[],
  now: number = Date.now()
): FoodInsight[] {
  const mainFoods = dietEntries
    .filter((d) => (d.foodType ?? 'main') === 'main' && d.startedAt)
    .sort(
      (a, b) =>
        a.startedAt.localeCompare(b.startedAt) ||
        (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
    );

  const insights: FoodInsight[] = [];

  // Zmeny krmiva: porovnaj okno pred a po nástupe.
  for (let i = 1; i < mainFoods.length; i += 1) {
    const food = mainFoods[i];
    const start = ms(food.startedAt);
    if (Number.isNaN(start)) continue;
    const afterEnd = food.endedAt
      ? Math.min(ms(food.endedAt), start + WINDOW_DAYS * DAY_MS)
      : start + WINDOW_DAYS * DAY_MS;

    for (const field of SYMPTOM_FIELDS) {
      const after = abnormalInRange(checkIns, field, start, afterEnd);
      const before = abnormalInRange(checkIns, field, start - WINDOW_DAYS * DAY_MS, start - 1);
      if (after && !before)
        insights.push({ kind: 'appeared', foodName: food.foodName, field, tone: 'watch' });
      else if (before && !after)
        insights.push({ kind: 'improved', foodName: food.foodName, field, tone: 'positive' });
    }
  }

  // Aktuálne hlavné krmivo bez negatívnej reakcie ≥ WINDOW dní.
  const openMain = mainFoods.filter((d) => !d.endedAt);
  const current = openMain[openMain.length - 1];
  if (current) {
    const start = ms(current.startedAt);
    if (!Number.isNaN(start) && now - start >= WINDOW_DAYS * DAY_MS) {
      const anyAbnormal = SYMPTOM_FIELDS.some((field) =>
        abnormalInRange(checkIns, field, start, now)
      );
      if (!anyAbnormal) {
        insights.push({ kind: 'noReaction', foodName: current.foodName, tone: 'positive' });
      }
    }
  }

  // Najnovšie zmeny prv (appeared/improved boli pridané vzostupne), potom limit.
  return insights.reverse().slice(0, MAX_INSIGHTS);
}
