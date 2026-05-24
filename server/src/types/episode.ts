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

export interface EpisodeAttachment {
  id: string;
  dataUrl: string;
  caption?: string;
  mimeType: string;
}

export interface HealthEpisodeRecord {
  id: string;
  dogId: string;
  createdAt: string;
  updatedAt: string;
  symptomTitle: string;
  symptomDescription: string;
  category: EpisodeCategory;
  startedAt: string;
  endedAt?: string;
  location?: string;
  triggers?: string[];
  diagnosis?: string;
  vetVisitId?: string;
  medicationIds: string[];
  treatmentNotes?: string;
  whatWorked: string[];
  whatDidntWork: string[];
  outcome: EpisodeOutcome;
  severity: EpisodeSeverity;
  lessonsLearned?: string;
  attachments?: EpisodeAttachment[];
}

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
