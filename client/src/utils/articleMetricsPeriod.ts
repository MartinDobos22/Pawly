import type { ArticleMetricsPeriod } from '../content/poradna/types';

interface PeriodOption {
  value: ArticleMetricsPeriod;
  /** Label do prepínača (ToggleButton). */
  label: string;
  /** Krátky suffix k metrikám na karte, napr. „30d". */
  short: string;
}

export const METRICS_PERIOD_OPTIONS: PeriodOption[] = [
  { value: '30d', label: '30 dní', short: '30d' },
  { value: '90d', label: '90 dní', short: '90d' },
  { value: 'all', label: 'Celé obdobie', short: 'celkovo' },
];

export function metricsPeriodShort(period: ArticleMetricsPeriod): string {
  return METRICS_PERIOD_OPTIONS.find((o) => o.value === period)?.short ?? period;
}

export function metricsPeriodLabel(period: ArticleMetricsPeriod): string {
  return METRICS_PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period;
}
