export type EpisodeCategory =
  | 'digestive'
  | 'skin'
  | 'musculoskeletal'
  | 'respiratory'
  | 'behavioral'
  | 'other';

export type EpisodeOutcome = 'resolved' | 'ongoing' | 'recurring';
export type EpisodeSeverity = 'mild' | 'moderate' | 'severe';

export const EPISODE_CATEGORIES: EpisodeCategory[] = [
  'digestive',
  'skin',
  'musculoskeletal',
  'respiratory',
  'behavioral',
  'other',
];

export const EPISODE_OUTCOMES: EpisodeOutcome[] = ['resolved', 'ongoing', 'recurring'];
export const EPISODE_SEVERITIES: EpisodeSeverity[] = ['mild', 'moderate', 'severe'];

export interface PastEpisodeInput {
  id: string;
  symptomTitle: string;
  symptomDescription?: string;
  category: EpisodeCategory;
  startedAt?: string;
  endedAt?: string;
  outcome?: EpisodeOutcome;
  severity?: EpisodeSeverity;
  whatWorked?: string[];
  whatDidntWork?: string[];
  lessonsLearned?: string;
}

export interface CurrentEpisodeInput {
  symptomTitle: string;
  symptomDescription?: string;
  category: EpisodeCategory;
}

export interface SimilarEpisodeSummary {
  similarEpisodeIds: string[];
  summary: string;
  recommendation: string;
}
