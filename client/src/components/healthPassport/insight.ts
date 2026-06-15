import type { ValidityStatus } from '../../types/petHealth';
import { daysDiff } from '../../utils/relativeDate';

export type InsightTone = 'good' | 'info' | 'warn';
export type UpcomingType = 'vaccination' | 'deworming' | 'ecto' | 'visit';
export type WeightTrend = 'up' | 'down' | 'flat';

export interface InsightItem {
  id: string;
  tone: InsightTone;
  key: string;
  params?: Record<string, string | number>;
}

export interface Insight {
  headlineKey: 'great' | 'attention' | 'getStarted';
  items: InsightItem[];
}

export interface UpcomingDue {
  type: UpcomingType;
  date?: string;
}

export interface InsightInput {
  petName: string;
  hasAnyRecord: boolean;
  vaccinationStatus: ValidityStatus;
  dewormingStatus: ValidityStatus;
  ectoStatus: ValidityStatus;
  upcoming: UpcomingDue[];
  weightTrend: WeightTrend | null;
  weightDeltaKg: number | null;
  allergyCount: number;
}

const preventiveStatuses = (input: InsightInput): ValidityStatus[] => [
  input.vaccinationStatus,
  input.dewormingStatus,
  input.ectoStatus,
];

export function buildInsight(input: InsightInput): Insight {
  if (!input.hasAnyRecord) {
    return {
      headlineKey: 'getStarted',
      items: [{ id: 'getStarted', tone: 'info', key: 'insight.itemGetStarted' }],
    };
  }

  const statuses = preventiveStatuses(input);
  const hasExpired = statuses.includes('EXPIRED');
  const items: InsightItem[] = [];

  const soonest = input.upcoming
    .map((u) => ({ type: u.type, diff: u.date ? daysDiff(u.date) : Number.NaN }))
    .filter((u) => !Number.isNaN(u.diff))
    .sort((a, b) => a.diff - b.diff)[0];

  if (soonest) {
    if (soonest.diff < 0) {
      items.push({
        id: 'overdue',
        tone: 'warn',
        key: `insight.overdue.${soonest.type}`,
        params: { count: Math.abs(soonest.diff) },
      });
    } else {
      items.push({
        id: 'next',
        tone: soonest.diff <= 14 ? 'info' : 'good',
        key: `insight.next.${soonest.type}`,
        params: { count: soonest.diff },
      });
    }
  }

  if (input.weightTrend) {
    items.push({
      id: 'weight',
      tone: input.weightTrend === 'flat' ? 'good' : 'info',
      key: `insight.weight.${input.weightTrend}`,
      params:
        input.weightDeltaKg !== null
          ? { delta: Math.abs(input.weightDeltaKg).toFixed(1) }
          : undefined,
    });
  }

  if (!hasExpired && !statuses.includes('UNKNOWN')) {
    items.push({ id: 'preventive', tone: 'good', key: 'insight.preventiveOk' });
  } else if (hasExpired) {
    items.push({ id: 'preventiveCheck', tone: 'warn', key: 'insight.preventiveCheck' });
  }

  if (input.allergyCount > 0) {
    items.push({
      id: 'allergy',
      tone: 'info',
      key: 'insight.allergyAware',
      params: { count: input.allergyCount },
    });
  }

  return {
    headlineKey: hasExpired ? 'attention' : 'great',
    items: items.slice(0, 4),
  };
}
