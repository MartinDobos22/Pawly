import type { EpisodeOutcome, EpisodeSeverity, EpisodeStatusUpdate } from '../types/healthEpisode';

export const OUTCOME_CHIP_COLOR: Record<
  EpisodeOutcome,
  'success' | 'warning' | 'error' | 'default'
> = {
  unspecified: 'default',
  resolved: 'success',
  ongoing: 'warning',
  recurring: 'error',
};

export const SEVERITY_CHIP_COLOR: Record<EpisodeSeverity, 'info' | 'warning' | 'error'> = {
  mild: 'info',
  moderate: 'warning',
  severe: 'error',
};

export function formatEpisodeDate(iso: string | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function sortStatusUpdatesNewestFirst(
  updates: EpisodeStatusUpdate[]
): EpisodeStatusUpdate[] {
  return [...updates].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function applyStatusUpdatesToOutcome(
  updates: EpisodeStatusUpdate[],
  currentOutcome: EpisodeOutcome,
  currentEndedAt: string | undefined
): { outcome: EpisodeOutcome; endedAt: string | undefined } {
  const withOutcome = updates.filter((u) => u.outcome);
  if (withOutcome.length === 0) {
    return { outcome: currentOutcome, endedAt: currentEndedAt };
  }
  const latest = withOutcome.reduce((acc, u) => (u.date >= acc.date ? u : acc));
  const outcome = latest.outcome ?? currentOutcome;
  const endedAt = outcome === 'resolved' && !currentEndedAt ? latest.date : currentEndedAt;
  return { outcome, endedAt };
}
