import type { EpisodeCategory, EpisodeOutcome, HealthEpisodeRecord } from '../types/healthEpisode';

export interface EpisodeFilters {
  category?: EpisodeCategory | 'all';
  outcome?: EpisodeOutcome | 'all';
  query?: string;
}

export function filterEpisodes(
  episodes: HealthEpisodeRecord[],
  filters: EpisodeFilters
): HealthEpisodeRecord[] {
  const query = filters.query?.trim().toLowerCase() ?? '';

  return episodes.filter((episode) => {
    if (filters.category && filters.category !== 'all' && episode.category !== filters.category) {
      return false;
    }
    if (filters.outcome && filters.outcome !== 'all' && episode.outcome !== filters.outcome) {
      return false;
    }
    if (!query) return true;

    const haystack = [
      episode.symptomTitle,
      episode.symptomDescription,
      episode.diagnosis ?? '',
      episode.location ?? '',
      episode.lessonsLearned ?? '',
      episode.treatmentNotes ?? '',
      ...(episode.triggers ?? []),
      ...episode.whatWorked,
      ...episode.whatDidntWork,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function sortEpisodesNewestFirst(episodes: HealthEpisodeRecord[]): HealthEpisodeRecord[] {
  return [...episodes].sort((a, b) => {
    const aDate = a.startedAt || a.createdAt;
    const bDate = b.startedAt || b.createdAt;
    return bDate.localeCompare(aDate);
  });
}
